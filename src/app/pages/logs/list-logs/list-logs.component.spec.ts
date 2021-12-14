import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogService, LogsResponse } from 'src/app/services/log.service';

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
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CrytonLogHarness } from 'src/app/modules/shared/components/cryton-log/cryton-log.harness';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('ListLogsComponent', () => {
  let component: ListLogsComponent;
  let fixture: ComponentFixture<ListLogsComponent>;
  let loader: HarnessLoader;

  const logServiceStub = jasmine.createSpyObj('LogService', ['fetchItems']) as Spied<LogService>;
  logServiceStub.fetchItems.and.returnValue(of(mockLogs));

  const compareLogsWithData = async (logs: CrytonLogHarness[], data: string[]): Promise<void> => {
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      expect(await log.getText()).toBe(data[i]);
    }
  };

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
        BrowserAnimationsModule,
        MatIconModule
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
    logServiceStub.fetchItems.and.returnValue(of(mockLogs));
    fixture = TestBed.createComponent(ListLogsComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.logs = mockLogs;
    component.loading$.next(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display fetched logs', async () => {
    component.loading$.next(false);
    const logs = await loader.getAllHarnesses(CrytonLogHarness);
    // Pagination works on backend only, so table will always display all of the items.
    expect(logs.length).toEqual(mockLogs.count);
    compareLogsWithData(logs, mockLogs.results);
  });

  it('should apply filter to request', async () => {
    component.loading$.next(false);
    const filterValue = 'testFilter';
    component.filterForm.get('filter').setValue(filterValue);

    await loader.getHarness(MatButtonHarness.with({ text: 'Apply' })).then(btn => btn.click());

    expect(logServiceStub.fetchItems).toHaveBeenCalledWith(0, 5, filterValue);
  });

  it('should refresh table on refresh button click', async () => {
    component.loading$.next(false);

    let logs = await loader.getAllHarnesses(CrytonLogHarness);
    compareLogsWithData(logs, mockLogs.results);

    const newLogs = JSON.parse(JSON.stringify(mockLogs)) as LogsResponse;
    newLogs.results = mockLogs.results.slice(0, 5);
    logServiceStub.fetchItems.and.returnValue(of(newLogs));

    await loader.getHarness(MatButtonHarness.with({ text: 'refresh' })).then(btn => btn.click());
    fixture.detectChanges();
    logs = await loader.getAllHarnesses(CrytonLogHarness);

    compareLogsWithData(logs, newLogs.results);
  });
});
