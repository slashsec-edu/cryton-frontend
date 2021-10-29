import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CrytonDatetimePipe } from '../../pipes/cryton-datetime.pipe';
import { MatCalendar } from '@angular/material/datepicker';
import { AlertService } from 'src/app/services/alert.service';
import { ComponentInputDirective } from '../../directives/component-input.directive';

export interface Time {
  hours: string;
  minutes: string;
  seconds: string;
}

@Component({
  selector: 'app-cryton-datetime-picker',
  templateUrl: './cryton-datetime-picker.component.html',
  styleUrls: ['./cryton-datetime-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonDatetimePickerComponent implements OnInit {
  @ViewChild(MatCalendar) calendar: MatCalendar<Date>;
  @ViewChild(ComponentInputDirective) alertHost: ComponentInputDirective;
  selectedDate: Date = new Date();
  time: Time = { hours: '12', minutes: '00', seconds: '00' };

  timeInputs = [
    { key: 'hours', placeholder: 'HH' },
    { key: 'minutes', placeholder: 'MM' },
    { key: 'seconds', placeholder: 'SS' }
  ];

  private _today: Date = new Date(new Date().toDateString());

  constructor(
    public dialogRef: MatDialogRef<CrytonDatetimePickerComponent>,
    private _crytonDateTimePipe: CrytonDatetimePipe,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.setTime();
  }

  /**
   * Closes datepicker dialog if selected datetime > current datetime
   * else displays error.
   */
  selectDatetime(): void {
    if (this.selectedDate > new Date()) {
      this.dialogRef.close(this.selectedDate);
    } else {
      this._alertService.showError('Selected date must be greater than current date.');
    }
  }

  /**
   * Returns display value of selected date.
   */
  getDate(): string {
    if (!this.selectedDate) {
      return 'Not Chosen';
    }
    return this._crytonDateTimePipe.transform(this.selectedDate.toString());
  }

  /**
   * Saves the date selected in mat-calendar
   * and sets the time to time selected in timepicker.
   *
   * @param date Selected Date
   */
  selectDate(date: Date): void {
    this.selectedDate = date;
    this.setTime();
  }

  /**
   * Checks if given time input is correct.
   */
  checkInput(input: string): void {
    const maxHours = 23;
    const maxMinsAndSecs = 59;

    if (input === 'hours') {
      this.time.hours = this._formatTimeRange(this.time.hours, maxHours);
    } else if (input === 'minutes') {
      this.time.minutes = this._formatTimeRange(this.time.minutes, maxMinsAndSecs);
    } else {
      this.time.seconds = this._formatTimeRange(this.time.seconds, maxMinsAndSecs);
    }
    this.setTime();
  }

  /**
   * Changes time based on input arrow clicks.
   *
   * @param input Time input unit.
   * @param increment Value to be added to chosen time.
   */
  changeTime(input: string, increment: number): void {
    const tempTime = new Date(this.selectedDate);

    if (input === 'hours') {
      tempTime.setHours(tempTime.getHours() + increment);
    } else if (input === 'minutes') {
      tempTime.setMinutes(tempTime.getMinutes() + increment);
    } else {
      tempTime.setSeconds(tempTime.getSeconds() + increment);
    }

    if (tempTime > this._today) {
      this.selectedDate = tempTime;
    }

    this._setTimeStrings();
    this.calendar.updateTodaysDate();
  }

  /**
   * Used for blocking past dates in material calendar.
   *
   * @param date Date object.
   */
  filterDates = (date: Date): boolean => date >= this._today;

  /**
   * Sets chosen time based on time inputs.
   */
  setTime(): void {
    this.selectedDate.setHours(
      parseInt(this.time.hours, 10),
      parseInt(this.time.minutes, 10),
      parseInt(this.time.seconds, 10)
    );
  }

  /**
   * Sets time inputs based on chosen time.
   */
  private _setTimeStrings(): void {
    this.time.hours = this._formatTimeWidth(this.selectedDate.getHours().toString());
    this.time.minutes = this._formatTimeWidth(this.selectedDate.getMinutes().toString());
    this.time.seconds = this._formatTimeWidth(this.selectedDate.getSeconds().toString());
  }

  /**
   * Formats time input to two integer places.
   *
   * @param time Time input.
   */
  private _formatTimeWidth(time: string): string {
    const integerPlaces = 2;
    return ('0' + time).slice(-integerPlaces);
  }

  /**
   * Formats time input to be in correct range and to contain only digits.
   *
   * @param time Input time.
   * @param maxTime Maximal possible time.
   */
  private _formatTimeRange(time: string, maxTime: number): string {
    if (!/^\d+$/.test(time)) {
      return '00';
    }
    if (parseInt(time, 10) > maxTime) {
      return maxTime.toString();
    }
    return this._formatTimeWidth(time);
  }
}
