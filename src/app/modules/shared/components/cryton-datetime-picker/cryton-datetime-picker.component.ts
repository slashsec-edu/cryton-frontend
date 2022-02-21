import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ComponentInputDirective } from '../../directives/component-input.directive';
import { CrytonTimePickerComponent } from '../cryton-time-picker/cryton-time-picker.component';

@Component({
  selector: 'app-cryton-datetime-picker',
  templateUrl: './cryton-datetime-picker.component.html',
  styleUrls: ['./cryton-datetime-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonDatetimePickerComponent implements AfterViewInit {
  @ViewChild(MatCalendar) calendar: MatCalendar<Date>;
  @ViewChild(CrytonTimePickerComponent) timePicker: CrytonTimePickerComponent;
  @ViewChild(ComponentInputDirective) alertHost: ComponentInputDirective;
  selectedDate: Date = new Date();

  private _today: Date = new Date(new Date().toDateString());

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: { blockPastDates?: boolean; selectedDate?: Date },
    public dialogRef: MatDialogRef<CrytonDatetimePickerComponent>,
    private _alertService: AlertService,
    private _cd: ChangeDetectorRef
  ) {
    if (this._data?.selectedDate) {
      this.selectDate(this._data.selectedDate);
    }
  }

  ngAfterViewInit(): void {
    if (this._data?.selectedDate) {
      const hours = this._data.selectedDate.getHours();
      const minutes = this._data.selectedDate.getMinutes();
      const seconds = this._data.selectedDate.getSeconds();

      this.timePicker.setTime(hours, minutes, seconds);
    }
    this._cd.detectChanges();
  }

  /**
   * Closes datepicker dialog if selected datetime > current datetime
   * else displays error.
   */
  selectDatetime(): void {
    const datetime = this.getDateTime();

    if (!this._data?.blockPastDates || datetime > new Date()) {
      this.dialogRef.close(datetime);
    } else {
      this._alertService.showError('Selected date must be greater than current date.');
    }
  }

  getDateTime(): Date {
    if (!this.selectedDate || !this.timePicker) {
      return null;
    }

    const datetime = new Date(this.selectedDate);
    const { hours, minutes, seconds } = this.timePicker.time;

    datetime.setHours(Number(hours));
    datetime.setMinutes(Number(minutes));
    datetime.setSeconds(Number(seconds));

    return datetime;
  }

  /**
   * Saves the date selected in mat-calendar
   * and sets the time to time selected in timepicker.
   *
   * @param date Selected Date
   */
  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  /**
   * Used for blocking past dates in material calendar.
   *
   * @param date Date object.
   */
  filterDates = (date: Date): boolean => !this._data?.blockPastDates || date >= this._today;

  handleDayChange(increment: number): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + increment);
    this.calendar.updateTodaysDate();
  }
}
