import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CrytonTimePickerComponent, Time, TimeUnit } from './cryton-time-picker.component';

describe('CrytonTimePickerComponent', () => {
  let component: CrytonTimePickerComponent;
  let fixture: ComponentFixture<CrytonTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrytonTimePickerComponent],
      imports: [MatIconModule, FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
      unit: TimeUnit;
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

      component.changeTime(scenario.increment.unit, scenario.increment.increment);
      expect(component.time).toEqual(scenario.timeAfter);
    });
  });
});
