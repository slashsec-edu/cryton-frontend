import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabsRouter } from '../../classes/utils/tabs-router';
import { TemplateConverterService } from '../../services/template-converter.service';

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

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _converter: TemplateConverterService
  ) {}

  ngOnInit(): void {
    TabsRouter.selectIndex$.pipe(takeUntil(this._destroy$)).subscribe((index: number) => {
      this.selectedIndex = index;
      this._changeDetector.detectChanges();
    });

    const id = this._route.snapshot.paramMap.get('id');

    if (id) {
      this._converter.editTemplate(Number(id)).subscribe();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
