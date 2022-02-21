import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { first, Subject, takeUntil } from 'rxjs';
import { CrytonDatetimePickerComponent } from 'src/app/modules/shared/components/cryton-datetime-picker/cryton-datetime-picker.component';
import { DateTimeForm } from '../../classes/stage-creation/forms/date-time-form';
import { TriggerParameters } from '../../classes/stage-creation/trigger-parameters';
import { DateTimeUtils } from '../../classes/stage-creation/utils/date-time.utils';
import { DateTimeArgs } from '../../models/interfaces/date-time-args';
import { timezones } from './time-zones';

@Component({
  selector: 'app-date-time-trigger-parameters',
  templateUrl: './date-time-trigger-parameters.component.html',
  styleUrls: ['./date-time-trigger-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateTimeTriggerParametersComponent extends TriggerParameters implements OnInit, OnDestroy {
  @Input() triggerForm: DateTimeForm;
  timezoneFilterCtrl = new FormControl();
  timezones = timezones;
  filteredTimezones = timezones;

  private _destroy$ = new Subject<void>();

  constructor(private _dialog: MatDialog) {
    super(null);
  }

  openDateTimePicker(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timezone, ...dateTimeArgs } = this.triggerForm.getArgs();
    const selectedDate = DateTimeUtils.dateFromDateTimeArgs(dateTimeArgs as DateTimeArgs);

    const dialog = this._dialog.open(CrytonDatetimePickerComponent, {
      width: '90%',
      maxWidth: '400px',
      data: { selectedDate }
    });

    dialog
      .afterClosed()
      .pipe(first())
      .subscribe(dateTime => {
        if (dateTime) {
          this._setArgs(dateTime);
        }
      });
  }

  getSelectedDateTime(): string | undefined {
    return this.triggerForm.getArgsForm().get('dateTime').value;
  }

  ngOnInit(): void {
    this.timezoneFilterCtrl.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value: string) => {
      this.filteredTimezones = this.timezones.filter(timezone =>
        timezone.toLocaleLowerCase().includes(value.toLocaleLowerCase())
      );
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setArgs(dateTime: string): void {
    const argsForm = this.triggerForm.getArgsForm();
    const timezone = argsForm.get('timezone').value;

    if (!dateTime) {
      argsForm.reset({ timezone });
      return;
    }

    const date = new Date(dateTime);

    argsForm.patchValue({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      displayDateTime: date.toLocaleString()
    });
  }
}
