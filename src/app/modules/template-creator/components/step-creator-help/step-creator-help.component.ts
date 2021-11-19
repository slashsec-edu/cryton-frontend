import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-step-creator-help',
  templateUrl: './step-creator-help.component.html',
  styleUrls: ['./step-creator-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepCreatorHelpComponent {
  constructor(private _dialogRef: MatDialogRef<StepCreatorHelpComponent>) {}

  close(): void {
    this._dialogRef.close();
  }
}
