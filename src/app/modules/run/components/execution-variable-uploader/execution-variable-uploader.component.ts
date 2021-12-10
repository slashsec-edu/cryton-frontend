import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  DebugElement,
  Output,
  EventEmitter
} from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { delay, first, switchMapTo } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { ExecutionVariableService } from 'src/app/services/execution-variable.service';

@Component({
  selector: 'app-execution-variable-uploader',
  templateUrl: './execution-variable-uploader.component.html',
  styleUrls: ['./execution-variable-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionVariableUploaderComponent {
  @ViewChild('fileInput') fileInput: DebugElement;
  @Input() executionID: number;
  @Output() uploaded = new EventEmitter<void>();
  selectedFile: File;

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(private _execVarService: ExecutionVariableService, private _alert: AlertService) {}

  handleFileSelection(files: FileList): void {
    this.selectedFile = files[0];
  }

  handleFileInput(inputChange: Event): void {
    const files = (inputChange.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      this.handleFileSelection(files);
    }
  }

  cancel(): void {
    this.selectedFile = null;
    const fileInput = this.fileInput.nativeElement as HTMLInputElement;
    fileInput.value = null;
  }

  upload(): void {
    this.loading$.next(true);

    of({})
      .pipe(
        first(),
        delay(200),
        switchMapTo(this._execVarService.uploadVariables(this.executionID, [this.selectedFile]))
      )
      .subscribe({
        next: msg => {
          this.loading$.next(false);
          this.cancel();
          this._alert.showSuccess(msg);
          this.uploaded.emit();
        },
        error: err => {
          this.loading$.next(false);
          this._alert.showError(err);
        }
      });
  }
}
