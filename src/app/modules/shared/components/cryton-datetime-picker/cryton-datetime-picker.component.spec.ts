import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CrytonDatetimePickerComponent } from './cryton-datetime-picker.component';
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
});
