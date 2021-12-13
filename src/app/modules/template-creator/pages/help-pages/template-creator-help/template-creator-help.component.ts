import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-template-creator-help',
  templateUrl: './template-creator-help.component.html',
  styleUrls: ['./template-creator-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCreatorHelpComponent {
  constructor(private _dialogRef: MatDialogRef<TemplateCreatorHelpComponent>) {}

  close(): void {
    this._dialogRef.close();
  }
}
