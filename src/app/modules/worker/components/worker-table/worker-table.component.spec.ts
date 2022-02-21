import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Worker } from 'src/app/models/api-responses/worker.interface';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AlertService } from 'src/app/services/alert.service';
import { WorkersService } from 'src/app/services/workers.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { WorkerTableComponent } from './worker-table.component';

describe('WorkerTableComponent', () => {
  let component: WorkerTableComponent;
  let fixture: ComponentFixture<WorkerTableComponent>;

  const workerServiceStub = jasmine.createSpyObj('WorkerService', ['healthCheck']) as Spied<WorkersService>;
  workerServiceStub.healthCheck.and.returnValue({ detail: { worker_model_id: 1, worker_state: 'DOWN' } });

  const worker: Worker = {
    url: 'http://localhost:8000/cryton/api/v1/workers/1/',
    id: 1,
    name: 'Hard Worker',
    address: '127.0.0.1',
    q_prefix: '15',
    state: 'UP'
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [MatPaginatorModule, MatTooltipModule, MatIconModule, SharedModule, BrowserAnimationsModule],
        declarations: [WorkerTableComponent],
        providers: [
          { provide: WorkersService, useValue: workerServiceStub },
          { provide: AlertService, useValue: alertServiceStub }
        ]
      })
        .overrideComponent(WorkerTableComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();

      fixture = TestBed.createComponent(WorkerTableComponent);
      component = fixture.componentInstance;
      component.data = worker;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display UP as the state of the first worker', () => {
    const elementRef = fixture.nativeElement as HTMLElement;
    const state = elementRef.querySelector('.worker-header--state > h2');
    expect(state.innerHTML).toBe('UP');
  });

  it('should display 1 as the RUN ID', () => {
    const elementRef = fixture.nativeElement as HTMLElement;
    const runID = elementRef.querySelector('aside > h3');
    expect(runID.innerHTML).toContain('1');
  });

  it('should have green header color', () => {
    const componentRef = fixture.componentInstance;
    const state = componentRef.data.state;
    const color = componentRef.getStateColor(state);
    expect(color).toBe('state-up');
  });

  it('should return correct class for each state', () => {
    const componentRef = fixture.componentInstance;

    expect(componentRef.getStateColor('UP')).toBe('state-up');
    expect(componentRef.getStateColor('DOWN')).toBe('state-down');
    expect(componentRef.getStateColor('READY')).toBe('state-ready');
    expect(componentRef.getStateColor('Ready')).toBe('state-ready');
    expect(componentRef.getStateColor('ReAdy')).toBe('state-ready');
    expect(componentRef.getStateColor('ReAdY')).toBe('state-ready');
  });
});
