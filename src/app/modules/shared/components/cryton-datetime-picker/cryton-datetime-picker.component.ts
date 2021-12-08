import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCalendar } from '@angular/material/datepicker';
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
    public dialogRef: MatDialogRef<CrytonDatetimePickerComponent>,
    private _alertService: AlertService,
    private _cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this._cd.detectChanges();
  }

  /**
   * Closes datepicker dialog if selected datetime > current datetime
   * else displays error.
   */
  selectDatetime(): void {
    const datetime = this.getDateTime();

    if (datetime > new Date()) {
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
  filterDates = (date: Date): boolean => date >= this._today;

  handleDayChange(increment: number): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + increment);
    this.calendar.updateTodaysDate();
  }
}
