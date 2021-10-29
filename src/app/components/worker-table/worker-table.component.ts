import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Worker } from '../../models/api-responses/worker.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-worker-table',
  templateUrl: './worker-table.component.html',
  styleUrls: ['./worker-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkerTableComponent implements OnInit, OnDestroy {
  @Input() data: Worker;

  maxStringLength = 15;
  private _destroySubject$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroySubject$.next();
    this._destroySubject$.complete();
  }

  // Returns class corresponding to worker state
  getStateColor(state: string): string {
    const lowerState: string = state.toLowerCase();
    const nameBase = 'worker-table--';

    return nameBase + lowerState;
  }

  handleSettings(worker: Worker): void {
    console.log(worker);
  }

  getTooltip(text: string): string {
    return text.length > this.maxStringLength ? text : null;
  }
}
