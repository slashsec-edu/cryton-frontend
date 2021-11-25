import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { StageNode } from '../../classes/dependency-tree/node/stage-node';
import { StageParametersComponent } from '../stage-parameters/stage-parameters.component';

@Component({
  selector: 'app-timeline-node-parameters',
  templateUrl: './timeline-node-parameters.component.html',
  styleUrls: ['./timeline-node-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineNodeParametersComponent implements OnInit, AfterViewInit {
  @ViewChild(StageParametersComponent) stageParams: StageParametersComponent;

  constructor(
    private _cd: ChangeDetectorRef,
    private _dialogRef: MatDialogRef<TimelineNodeParametersComponent>,
    private _alertService: AlertService,
    @Inject(MAT_DIALOG_DATA) public data: { stage: StageNode }
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.stageParams.setEditedNodeName(this.data.stage.name);

    this.stageParams.fillFromStage(this.data.stage);
    this._cd.detectChanges();
  }

  /**
   * Closes dialog window.
   */
  close(): void {
    this.stageParams.setEditedNodeName(null);
    this._dialogRef.close();
  }

  /**
   * Edits stage parameters and closes dialog window.
   */
  save(): void {
    try {
      this.stageParams.editStage(this.data.stage);
      this.close();
    } catch (e) {
      if (e instanceof Error) {
        this._alertService.showError(e.message);
      }
    }
  }
}
