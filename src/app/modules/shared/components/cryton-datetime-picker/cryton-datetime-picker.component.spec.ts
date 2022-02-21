import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { SharedModule } from '../../shared.module';
import { CrytonDatetimePickerComponent } from './cryton-datetime-picker.component';

describe('CrytonDatetimePickerComponent', () => {
  let component: CrytonDatetimePickerComponent;
  let fixture: ComponentFixture<CrytonDatetimePickerComponent>;

  const dialogData = { blockPastDates: false };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonDatetimePickerComponent, CrytonDatetimePipe],
        imports: [MatDialogModule, MatDatepickerModule, SharedModule, BrowserAnimationsModule, MatNativeDateModule],
        providers: [
          CrytonDatetimePipe,
          { provide: MAT_DIALOG_DATA, useValue: dialogData },
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

  it('should call selectDatetime method after selecting date', () => {
    const correctDate = new Date();
    correctDate.setHours(correctDate.getHours() + 1);
    spyOn(component, 'selectDatetime');

    component.selectDatetime();
    fixture.detectChanges();

    expect(component.selectDatetime).toHaveBeenCalled();
  });

  describe('blockPastDates = true', () => {
    beforeEach(() => {
      dialogData.blockPastDates = true;
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
  });
});
