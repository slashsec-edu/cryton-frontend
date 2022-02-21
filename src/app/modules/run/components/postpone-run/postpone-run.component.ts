import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CrytonTimePickerComponent } from 'src/app/modules/shared/components/cryton-time-picker/cryton-time-picker.component';

@Component({
  selector: 'app-postpone-run',
  templateUrl: './postpone-run.component.html',
  styleUrls: ['./postpone-run.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostponeRunComponent {
  @ViewChild(CrytonTimePickerComponent) timePicker: CrytonTimePickerComponent;

  constructor(private _dialogRef: MatDialogRef<PostponeRunComponent>) {}

  postpone(): void {
    const { hours, minutes, seconds } = this.timePicker.time;

    if (hours === '00' && minutes === '00' && seconds === '00') {
      this._dialogRef.close();
    } else {
      const delta = `${Number(hours)}h${Number(minutes)}m${Number(seconds)}s`;
      this._dialogRef.close(delta);
    }
  }
}
