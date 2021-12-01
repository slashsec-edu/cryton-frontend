import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-template-timeline-help',
  templateUrl: './template-timeline-help.component.html',
  styleUrls: ['./template-timeline-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateTimelineHelpComponent implements OnInit {
  constructor(private _dialogRef: MatDialogRef<TemplateTimelineHelpComponent>) {}

  ngOnInit(): void {}

  close(): void {
    this._dialogRef.close();
  }
}
