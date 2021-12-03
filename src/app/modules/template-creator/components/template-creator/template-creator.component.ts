import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabsRouter } from '../../classes/utils/tabs-router';

@Component({
  selector: 'app-template-creator',
  templateUrl: './template-creator.component.html',
  styleUrls: ['./template-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCreatorComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) matTabGroup: MatTabGroup;
  selectedIndex = 0;

  private _destroy$ = new Subject<void>();

  constructor(private _changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    TabsRouter.selectIndex$.pipe(takeUntil(this._destroy$)).subscribe((index: number) => {
      this.selectedIndex = index;
      this._changeDetector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
