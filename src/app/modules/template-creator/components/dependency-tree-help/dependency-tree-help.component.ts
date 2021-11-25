import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dependency-tree-help',
  templateUrl: './dependency-tree-help.component.html',
  styleUrls: ['./dependency-tree-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyTreeHelpComponent {
  constructor(private _dialogRef: MatDialogRef<DependencyTreeHelpComponent>) {}

  close(): void {
    this._dialogRef.close();
  }
}
