import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tick-size-picker',
  templateUrl: './tick-size-picker.component.html',
  styleUrls: ['./tick-size-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TickSizePickerComponent implements OnInit, OnDestroy {
  @Output() tickChange = new EventEmitter<number>();

  @Input()
  set tickSeconds(value: number) {
    let size: number, unit: number;

    if (value < 60) {
      size = value;
      unit = 1;
    } else if (value < 3600) {
      size = value / 60;
      unit = 60;
    } else {
      size = value / 3600;
      unit = 3600;
    }

    this.tickForm.setValue({
      size,
      unit
    });
  }

  tickOptions = [
    { display: 'Seconds', value: 1 },
    { display: 'Minutes', value: 60 },
    { display: 'Hours', value: 3600 }
  ];
  tickForm = new FormGroup({
    size: new FormControl(5, [Validators.required, Validators.min(1)]),
    unit: new FormControl(1, [Validators.required])
  });

  private _destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this._createTickChangeSub();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _createTickChangeSub(): void {
    this.tickForm.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
      const { size, unit } = this.tickForm.value as Record<string, number>;

      if (this.tickForm.valid) {
        this.tickChange.emit(size * unit);
      }
    });
  }
}
