import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cryton-file-uploader',
  templateUrl: './cryton-file-uploader.component.html',
  styleUrls: ['./cryton-file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonFileUploaderComponent implements OnInit, OnDestroy {
  /**
   * Specifies if file input should accept multiple files.
   */
  @Input() multipleFiles = true;
  /**
   * Subject for trigerring erase event by parent component.
   */
  @Input() eraseEvent$: Observable<void>;
  /**
   * Emits when user selects file(s).
   */
  @Output() fileChange = new EventEmitter<File[]>();

  selectedFiles: File[];
  destroySubject$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    if (this.eraseEvent$) {
      this.eraseEvent$.pipe(takeUntil(this.destroySubject$)).subscribe(() => this.discardFiles());
    }
  }

  ngOnDestroy(): void {
    this.destroySubject$.next();
  }

  /**
   * Sets files selected in file input to selectedFiles variable and emits fileChange event.
   * Prevents multiple file upload by drag & drop if it is forbidden.
   *
   * @param files Selected files.
   */
  handleFileInput(files: FileList): void {
    const tempFiles = Array.from(files);

    if (!this.multipleFiles && tempFiles.length > 1) {
      this.selectedFiles = [tempFiles[0]];
    } else {
      this.selectedFiles = Array.from(files);
    }

    this.fileChange.emit(this.selectedFiles);
  }

  /**
   * Handles file input change.
   *
   * @param changeEvent Event triggered on file input change.
   */
  handleFileInputChange(changeEvent: Event): void {
    const files = (changeEvent.target as HTMLInputElement).files;
    this.handleFileInput(files);
  }

  /**
   * Discards all selected files.
   */
  discardFiles(): void {
    this.selectedFiles = undefined;
    this.fileChange.emit(null);
  }
}
