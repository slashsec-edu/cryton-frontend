import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Run } from 'src/app/models/api-responses/run.interface';
import { CrytonButtonHarness } from 'src/app/modules/shared/components/cryton-button/cryton-button.harness';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { ExpandedRunManipulationComponent } from './expanded-run-manipulation.component';

enum Button {
  EXECUTE = 'Execute run',
  PAUSE = 'Pause run',
  UNPAUSE = 'Unpause run',
  SCHEDULE = 'Schedule run',
  UNSCHEDULE = 'Unschedule run',
  RESCHEDULE = 'Reschedule run',
  DELETE = 'Delete run',
  KILL = 'Kill run',
  POSTPONE = 'Postpone run'
}

describe('ExpandedRunManipulationComponent', () => {
  let component: ExpandedRunManipulationComponent;
  let fixture: ComponentFixture<ExpandedRunManipulationComponent>;
  let loader: HarnessLoader;
  let buttons: CrytonButtonHarness[];

  const mockRowData: Run = {
    url: 'http://localhost:8000/cryton/api/v1/runs/1/',
    id: 1,
    plan_executions: ['http://localhost:8000/cryton/api/v1/plan_executions/1/'],
    created_at: '2020-06-29T16:45:23.615123',
    updated_at: '2020-06-29T16:45:23.615136',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'PENDING',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/1/'
  };

  const rowData0 = Object.assign({}, mockRowData);

  const rowData1 = Object.assign({}, mockRowData);
  rowData1.state = 'RUNNING';

  const rowData2 = Object.assign({}, mockRowData);
  rowData2.state = 'SCHEDULED';
  rowData2.start_time = '2020-06-29T16:45:23.615136';

  const rowData3 = Object.assign({}, mockRowData);
  rowData3.state = 'PAUSED';

  const rowData4 = Object.assign({}, mockRowData);
  rowData4.state = 'PAUSING';

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, MatDialogModule, BrowserAnimationsModule, SharedModule, MatProgressBarModule],
        declarations: [ExpandedRunManipulationComponent],
        providers: [{ provide: AlertService, useValue: alertServiceStub }]
      })
        .overrideComponent(ExpandedRunManipulationComponent, {
          set: { changeDetection: ChangeDetectionStrategy.Default }
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandedRunManipulationComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    component = fixture.componentInstance;
    component.rowData = mockRowData;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  class Scenario {
    constructor(public id: number, public rowData: Run, public displayedButtons: string[]) {}
  }

  const scenarios: Scenario[] = [
    new Scenario(1, rowData0, [Button.EXECUTE, Button.SCHEDULE, Button.DELETE]),
    new Scenario(2, rowData1, [Button.PAUSE, Button.DELETE, Button.KILL]),
    new Scenario(3, rowData2, [Button.RESCHEDULE, Button.UNSCHEDULE, Button.DELETE, Button.POSTPONE]),
    new Scenario(4, rowData3, [Button.UNPAUSE, Button.DELETE]),
    new Scenario(5, rowData4, [Button.DELETE])
  ];

  for (const scenario of scenarios) {
    it(`Scenario ${scenario.id}: should display only following buttons: [${scenario.displayedButtons.join(
      ', '
    )}]"`, async () => {
      Object.assign(component.rowData, scenario.rowData);
      fixture.detectChanges();

      buttons = await loader.getAllHarnesses(CrytonButtonHarness);
      const buttonNames = await Promise.all(buttons.map(async button => await button.getName()));
      const actualButtons = buttonNames.sort().join();
      const wantedButtons = scenario.displayedButtons.sort().join();

      expect(actualButtons).toEqual(wantedButtons);
    });
  }

  it('should display a loading bar', () => {
    component.loadingSubject$.next(true);
    fixture.detectChanges();

    const loadingBar = fixture.debugElement.query(By.css('.mat-progress-bar'));

    expect(loadingBar.parent.styles.visibility).toEqual('initial');
  });
});
