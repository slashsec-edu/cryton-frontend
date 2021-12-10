import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, AfterViewInit } from '@angular/core';

export interface Time {
  hours: string;
  minutes: string;
  seconds: string;
}
export interface TimeInput {
  key: TimeUnit;
  placeholder: string;
}
export type TimeUnit = 'hours' | 'minutes' | 'seconds';

@Component({
  selector: 'app-cryton-time-picker',
  templateUrl: './cryton-time-picker.component.html',
  styleUrls: ['./cryton-time-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonTimePickerComponent implements OnInit, AfterViewInit {
  @Output() timeChange = new EventEmitter<Time>();
  @Output() dayChange = new EventEmitter<number>();
  @Output() initialized = new EventEmitter<void>();

  timeInputs: TimeInput[] = [
    { key: 'hours', placeholder: 'HH' },
    { key: 'minutes', placeholder: 'MM' },
    { key: 'seconds', placeholder: 'SS' }
  ];
  time: Time;

  constructor() {}

  ngOnInit(): void {
    this.time = { hours: '00', minutes: '00', seconds: '00' };
  }

  ngAfterViewInit(): void {
    this.initialized.emit();
  }

  /**
   * Checks if given time input is correct.
   */
  checkInput(input: string): void {
    if (input === 'hours') {
      this.time.hours = this._formatTimeRange(this.time.hours, 23);
    } else if (input === 'minutes') {
      this.time.minutes = this._formatTimeRange(this.time.minutes, 59);
    } else {
      this.time.seconds = this._formatTimeRange(this.time.seconds, 59);
    }
    this.timeChange.emit(this.time);
  }

  /**
   * Changes time based on input arrow clicks.
   *
   * @param input Time input unit.
   * @param increment Value to be added to chosen time.
   */
  changeTime(input: TimeUnit, increment: number): void {
    if (input === 'hours') {
      let newHours = Number(this.time.hours) + increment;

      if (newHours > 23) {
        newHours = 0;
        this.dayChange.emit(1);
      } else if (newHours < 0) {
        newHours = 23;
        this.dayChange.emit(-1);
      }

      this.time.hours = this._formatTimeWidth(newHours.toString());
    } else if (input === 'minutes') {
      let newMinutes = Number(this.time.minutes) + increment;

      if (newMinutes > 59) {
        newMinutes = 0;
        this.changeTime('hours', 1);
      } else if (newMinutes < 0) {
        newMinutes = 59;
        this.changeTime('hours', -1);
      }

      this.time.minutes = this._formatTimeWidth(newMinutes.toString());
    } else {
      let newSeconds = Number(this.time.seconds) + increment;

      if (newSeconds > 59) {
        newSeconds = 0;
        this.changeTime('minutes', 1);
      } else if (newSeconds < 0) {
        newSeconds = 59;
        this.changeTime('minutes', -1);
      }

      this.time.seconds = this._formatTimeWidth(newSeconds.toString());
    }
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
