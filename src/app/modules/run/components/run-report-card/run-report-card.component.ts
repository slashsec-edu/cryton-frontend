import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { Report } from 'src/app/models/api-responses/report/report.interface';
import { ReportManiupulationComponent } from 'src/app/modules/shared/components/run-manipulation/report-manipulation.component';

@Component({
  selector: 'app-run-report-card',
  templateUrl: './run-report-card.component.html',
  styleUrls: ['../../styles/report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunReportCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(ReportManiupulationComponent) runManipulation: ReportManiupulationComponent;
  @Input() report: Report;

  private _destroy$ = new Subject<void>();

  constructor(private _cd: ChangeDetectorRef, private _router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this._createRunDeleteSub();
    this._createRunUpdateSub();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _createRunUpdateSub(): void {
    this.runManipulation.rowUpdate.pipe(takeUntil(this._destroy$)).subscribe(report => {
      this.report = report;
      this._cd.detectChanges();
    });
  }

  private _createRunDeleteSub(): void {
    this.runManipulation.delete.pipe(first()).subscribe(() => {
      this._router.navigate(['app', 'runs']);
    });
  }
}
