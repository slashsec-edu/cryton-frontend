import { ComponentFixture, waitForAsync, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WorkersDashboardComponent } from './workers-dashboard.component';
import { workers } from 'src/app/testing/mockdata/workers.mockdata';
import { Spied } from 'src/app/testing/utility/utility-types';
import { WorkersService } from 'src/app/services/workers.service';
import { BehaviorSubject } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { WorkerTableHarness } from 'src/app/components/worker-table/worker-table.harness';
import { WorkerTableComponent } from 'src/app/components/worker-table/worker-table.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { Worker } from 'src/app/models/api-responses/worker.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';

describe('WorkersDashboardComponent', () => {
  let component: WorkersDashboardComponent;
  let fixture: ComponentFixture<WorkersDashboardComponent>;
  let loader: HarnessLoader;

  const workers$ = new BehaviorSubject({ count: workers.length, data: workers });

  const workersServiceStub = jasmine.createSpyObj('WorkersService', ['fetchItems']) as Spied<WorkersService>;
  workersServiceStub.fetchItems.and.returnValue(workers$.asObservable());

  const compareWorkerWithData = async (workerTable: WorkerTableHarness, data: Worker): Promise<void> => {
    expect(await workerTable.getID()).toBe(data.id);
    expect(await workerTable.getState()).toBe(data.state);
    expect(await workerTable.getName()).toBe(data.name);
    expect(await workerTable.getAddress()).toBe(data.address);
    expect(await workerTable.getQPrefix()).toBe(data.q_prefix);
  };

  const compareWorkersWithData = async (workerTables: WorkerTableHarness[], data: Worker[]): Promise<void> => {
    expect(workerTables.length).toBe(data.length);

    for (let i = 0; i < workerTables.length; i++) {
      await compareWorkerWithData(workerTables[i], data[i]);
    }
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [WorkersDashboardComponent, WorkerTableComponent],
        imports: [
          MatButtonModule,
          MatIconModule,
          BrowserAnimationsModule,
          MatPaginatorModule,
          SharedModule,
          MatTooltipModule,
          MatProgressBarModule
        ],
        providers: [{ provide: WorkersService, useValue: workersServiceStub }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    workers$.next({ count: workers.length, data: workers });
    fixture = TestBed.createComponent(WorkersDashboardComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show fetched workers', async () => {
    const workerTables = await loader.getAllHarnesses(WorkerTableHarness);
    expect(workerTables.length).toBe(workers.length);

    compareWorkersWithData(workerTables, workers);
  });

  it('should reload fetched workers', async () => {
    let workerTables = await loader.getAllHarnesses(WorkerTableHarness);
    expect(workerTables.length).toBe(workers.length);
    compareWorkerWithData(workerTables[0], workers[0]);

    workers$.next({ count: 1, data: [workers[0]] });
    const reloadBtn = await loader.getHarness(MatButtonHarness.with({ text: 'refresh' }));
    await reloadBtn.click();
    fixture.detectChanges();
    workerTables = await loader.getAllHarnesses(WorkerTableHarness);

    compareWorkersWithData(workerTables, [workers[0]]);
  });
});
