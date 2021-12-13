import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-stage-creator-help',
  templateUrl: './stage-creator-help.component.html',
  styleUrls: ['./stage-creator-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageCreatorHelpComponent {
  constructor(private _dialogRef: MatDialogRef<StageCreatorHelpComponent>) {}

  close(): void {
    this._dialogRef.close();
  }
}
