import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CrytonDatetimePickerComponent, Time } from './cryton-datetime-picker.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { SharedModule } from '../../shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';

describe('CrytonDatetimePickerComponent', () => {
  let component: CrytonDatetimePickerComponent;
  let fixture: ComponentFixture<CrytonDatetimePickerComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonDatetimePickerComponent, CrytonDatetimePipe],
        imports: [MatDialogModule, MatDatepickerModule, SharedModule, BrowserAnimationsModule, MatNativeDateModule],
        providers: [
          CrytonDatetimePipe,
          { provide: MatDialogRef, useValue: {} },
          { provide: AlertService, useValue: alertServiceStub }
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonDatetimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should throw an error when user selects past date or time', fakeAsync(() => {
    const invalidDate: Date = new Date();
    invalidDate.setHours(invalidDate.getHours() - 1);

    component.selectedDate = invalidDate;
    component.selectDatetime();

    tick(15);
    fixture.detectChanges();

    expect(alertServiceStub.showError).toHaveBeenCalled();
  }));

  it('should call selectDatetime method after selecting date', () => {
    const correctDate = new Date();
    correctDate.setHours(correctDate.getHours() + 1);
    spyOn(component, 'selectDatetime');

    component.selectDatetime();
    fixture.detectChanges();

    expect(component.selectDatetime).toHaveBeenCalled();
  });

  it('should correctly check numeric time inputs', () => {
    for (let i = 0; i < 20; i++) {
      const randomInput = Math.floor(Math.random() * 500);
      let correctRes;

      if (randomInput > 23) {
        correctRes = '23';
      } else if (randomInput < 0) {
        correctRes = '00';
      } else {
        correctRes = ('0' + randomInput.toString()).slice(-2);
      }

      component.time.hours = randomInput.toString();
      component.checkInput('hours');
      expect(component.time.hours).toEqual(correctRes);
    }
  });

  it('should correctly check non numeric time inputs', () => {
    for (let i = 0; i < 20; i++) {
      const charCodes = [Math.floor(Math.random() * 47), Math.floor(Math.random() * 255) + 58];
      const charCode = Math.floor(Math.random()) ? charCodes[1] : charCodes[0];

      component.time.minutes = String.fromCharCode(charCode);
      component.checkInput('minutes');

      expect(component.time.minutes).toEqual('00');
    }
  });

  it('should correctly skip hours and minutes', () => {
    interface Increment {
      unit: string;
      increment: number;
    }
    class Scenario {
      constructor(public timeBefore: Time, public increment: Increment, public timeAfter: Time) {}
    }
    const scenarios = [
      new Scenario(
        { hours: '23', minutes: '59', seconds: '59' },
        { unit: 'seconds', increment: 1 },
        { hours: '00', minutes: '00', seconds: '00' }
      ),
      new Scenario(
        { hours: '00', minutes: '00', seconds: '59' },
        { unit: 'seconds', increment: 1 },
        { hours: '00', minutes: '01', seconds: '00' }
      ),
      new Scenario(
        { hours: '00', minutes: '00', seconds: '00' },
        { unit: 'seconds', increment: -1 },
        { hours: '23', minutes: '59', seconds: '59' }
      ),
      new Scenario(
        { hours: '12', minutes: '59', seconds: '15' },
        { unit: 'minutes', increment: 1 },
        { hours: '13', minutes: '00', seconds: '15' }
      ),
      new Scenario(
        { hours: '12', minutes: '00', seconds: '15' },
        { unit: 'minutes', increment: -1 },
        { hours: '11', minutes: '59', seconds: '15' }
      ),
      new Scenario(
        { hours: '23', minutes: '00', seconds: '00' },
        { unit: 'hours', increment: 1 },
        { hours: '00', minutes: '00', seconds: '00' }
      ),
      new Scenario(
        { hours: '00', minutes: '00', seconds: '00' },
        { unit: 'hours', increment: -1 },
        { hours: '23', minutes: '00', seconds: '00' }
      )
    ];

    scenarios.forEach(scenario => {
      component.time = scenario.timeBefore;
      component.setTime();

      component.changeTime(scenario.increment.unit, scenario.increment.increment);
      expect(component.time).toEqual(scenario.timeAfter);
    });
  });
});
