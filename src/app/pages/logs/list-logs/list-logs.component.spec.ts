import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogService } from 'src/app/services/log.service';

import { ListLogsComponent } from './list-logs.component';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockLogs } from 'src/app/testing/mockdata/logs.mockdata';
import { Spied } from 'src/app/testing/utility/utility-types';
import { of } from 'rxjs';
import { CrytonLogComponent } from 'src/app/modules/shared/components/cryton-log/cryton-log.component';

describe('ListLogsComponent', () => {
  let component: ListLogsComponent;
  let fixture: ComponentFixture<ListLogsComponent>;

  const logServiceStub = jasmine.createSpyObj('LogService', ['fetchItems']) as Spied<LogService>;

  logServiceStub.fetchItems.and.returnValue(of(mockLogs));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListLogsComponent, CrytonLogComponent],
      imports: [
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDividerModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: LogService, useValue: logServiceStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    })
      .overrideComponent(ListLogsComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
