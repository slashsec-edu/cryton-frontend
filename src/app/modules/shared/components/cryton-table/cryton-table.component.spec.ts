import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CrytonTableComponent } from './cryton-table.component';
import { runs } from 'src/app/testing/mockdata/runs.mockdata';
import { CrytonDatetimePipe } from '../../pipes/cryton-datetime.pipe';
import { RunTableDataSource } from 'src/app/models/data-sources/run-table.data-source';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/modules/shared/shared.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';

import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { TestComponent } from 'src/app/testing/components/test.component';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { TestingService } from 'src/app/testing/services/testing.service';
import { TableFilter } from 'src/app/models/cryton-table/interfaces/table-filter.interface';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
import { ChangeDetectionStrategy, DebugElement } from '@angular/core';
import { Subject, of, Observable } from 'rxjs';
import { Run } from 'src/app/models/api-responses/run.interface';
import { RunService } from 'src/app/services/run.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CrytonCounterHarness } from '../cryton-counter/cryton-counter.harness';
import { CrytonTableRowHarness } from './cryton-table-row.harness';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';

describe('CrytonTableComponent', () => {
  let component: CrytonTableComponent<HasID>;
  let fixture: ComponentFixture<CrytonTableComponent<HasID>>;
  let loader: HarnessLoader;

  const eraseSubject$ = new Subject<void>();
  const testingService = new TestingService(runs);
  let tableRows: DebugElement[];

  // Uses fake testing service to provide pagination and filtering for mock data.
  const runServiceStub = jasmine.createSpyObj('RunService', ['fetchItems']) as Spied<RunService>;
  runServiceStub.fetchItems.and.callFake((offset: number, limit: number, orderBy: string, filter: TableFilter) =>
    testingService.fetchItems(offset, limit, orderBy, filter)
  );

  const getRows = () => fixture.debugElement.queryAll(By.css('.mat-row'));
  const getRowIds = () => {
    tableRows = getRows();
    return tableRows.map(row => {
      const columnIdElement = row.query(By.css('.mat-column-id')).nativeElement as HTMLElement;
      return columnIdElement.textContent.trim();
    });
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonTableComponent, CrytonButtonComponent, ComponentInputDirective],
        imports: [
          MatPaginatorModule,
          BrowserAnimationsModule,
          MatIconModule,
          MatSortModule,
          MatTableModule,
          MatProgressBarModule,
          MatProgressSpinnerModule,
          MatButtonModule,
          MatInputModule,
          MatDialogModule,
          MatFormFieldModule,
          MatCheckboxModule,
          MatRadioModule,
          MatTooltipModule,
          FormsModule,
          ReactiveFormsModule,
          SharedModule
        ],
        providers: [{ provide: AlertService, useValue: alertServiceStub }]
      })
        .overrideComponent(CrytonTableComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonTableComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    component.expandedComponent = undefined;
    component.sort = 'id';
    component.header = 'TESTING TABLE';
    component.filter = undefined;
    component.eraseEvent$ = eraseSubject$.asObservable();
    component.dataSource = new RunTableDataSource((runServiceStub as unknown) as RunService, new CrytonDatetimePipe());
    component.createButton = { value: 'test', link: '/test' };
    fixture.detectChanges();

    tableRows = getRows();
  });

  it('should sort results by ID by default', () => {
    const rowIds = getRowIds();
    expect(rowIds).toEqual(['1', '2', '3', '4', '5']);
  });

  it('should sort by ID in reverse on click on ID column', () => {
    const idColumn: DebugElement = fixture.debugElement.query(By.css('.mat-column-id'));
    const sortButton = idColumn.query(By.css('[role=button]')).nativeElement as HTMLElement;

    sortButton.click();
    sortButton.click();
    fixture.detectChanges();

    const rowIds = getRowIds();
    expect(rowIds).toEqual(['9', '8', '7', '6', '5']);
  });

  describe('Checkbox and radio tests', () => {
    let checkboxes: MatCheckboxHarness[];
    let radios: MatRadioButtonHarness[];

    const clickFirstRow = async (): Promise<void> => {
      const firstRow = await loader.getHarness(CrytonTableRowHarness);
      return await firstRow.click();
    };

    const expectChecks = (radio: boolean, checkbox: boolean): void => {
      if (radio) {
        expect(component.checkedRadio).toBeTruthy();
      } else {
        expect(component.checkedRadio).toBeFalsy();
      }

      if (checkbox) {
        expect(component.checkedCheckboxes.length).toBeGreaterThan(0);
      } else {
        expect(component.checkedCheckboxes.length).toEqual(0);
      }
    };

    beforeEach(async () => {
      component.expandedComponent = undefined;
      component.showCheckboxes = true;
      component.showRadioButtons = true;
      fixture.detectChanges();

      checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
      radios = await loader.getAllHarnesses(MatRadioButtonHarness);
    });

    it('should display radio buttons', () => {
      expect(radios).toBeTruthy();
    });

    it('should display checkboxes', () => {
      expect(checkboxes).toBeTruthy();
    });

    it('should correctly store checkbox and radio states', async () => {
      await radios[0].check();
      await radios[3].check();
      await checkboxes[1].check();
      await checkboxes[4].check();

      fixture.detectChanges();

      expect(Array.from(component.checkedCheckboxes).map((run: Run) => run.id)).toEqual([2, 5]);
      expect((component.checkedRadio as Run).id).toEqual(4);
    });

    it('should emit checkbox and radio click events', async () => {
      fixture.detectChanges();

      spyOn(component.checkboxChange, 'emit').and.callThrough();
      spyOn(component.radioChange, 'emit').and.callThrough();

      await radios[0].check();
      await checkboxes[0].check();
      await checkboxes[1].check();
      await checkboxes[2].check();

      expect(component.radioChange.emit).toHaveBeenCalled();
      expect(component.checkboxChange.emit).toHaveBeenCalledTimes(3);
    });

    it('should uncheck all radios and checkboxes on erase event', async () => {
      fixture.detectChanges();

      await radios[2].check();
      await checkboxes[3].check();
      await checkboxes[2].check();

      expectChecks(true, true);

      eraseSubject$.next(); // Triggers erase event
      fixture.detectChanges();

      expectChecks(false, false);
    });

    it('should check radio button on row click', async () => {
      component.showCheckboxes = false;
      fixture.detectChanges();

      expectChecks(false, false);

      await clickFirstRow();
      fixture.detectChanges();

      expectChecks(true, false);
    });

    it('should check checkbox on row click', async () => {
      component.showRadioButtons = false;
      fixture.detectChanges();

      expectChecks(false, false);

      await clickFirstRow();
      fixture.detectChanges();

      expectChecks(false, true);
    });

    it('should not check anything when the table displays both checkboxes and radios', async () => {
      expectChecks(false, false);

      await clickFirstRow();
      fixture.detectChanges();

      expectChecks(false, false);
    });

    it('should not check anything when table does not display checkboxes nor radios', async () => {
      component.showCheckboxes = false;
      component.showRadioButtons = false;
      fixture.detectChanges();

      expectChecks(false, false);

      await clickFirstRow();
      fixture.detectChanges();

      expectChecks(false, false);
    });
  });

  it('should be defined', () => {
    expect(component).toBeTruthy();
  });

  it('should display "TESTING TABLE" in the header', () => {
    const header = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    expect(header.textContent).toEqual('TESTING TABLE');
  });

  it('should display 5 runs', () => {
    expect(tableRows.length).toEqual(5);
  });

  it('should display 4 runs on the second page', () => {
    const nextButton = fixture.debugElement.query(By.css('.mat-paginator-navigation-next'))
      .nativeElement as HTMLElement;
    nextButton.click();
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('.mat-row')).length).toEqual(4);
  });

  it('should filter only row with id 1', () => {
    component.filter = { column: 'id', filter: '1' };
    component.loadPage();
    fixture.detectChanges();

    tableRows = getRows();
    const firstRow = tableRows[0].query(By.css('.mat-column-id')).nativeElement as HTMLElement;

    expect(tableRows.length).toEqual(1);
    expect(firstRow.textContent).toContain('1');
  });

  it('should display total number of runs as 9', async () => {
    const expectedCount = '9';

    const counterCount = await loader.getHarness(CrytonCounterHarness).then(counter => counter.getCount());
    const paginatorRange = await loader.getHarness(MatPaginatorHarness).then(paginator => paginator.getRangeLabel());

    const rangeFragments = paginatorRange.split(' ');
    const paginatorCount = rangeFragments[rangeFragments.length - 1];

    expect(counterCount).toEqual(expectedCount);
    expect(paginatorCount).toEqual(expectedCount);
  });

  it('should display a button with value "test" in the header', () => {
    const button = fixture.debugElement.query(By.css('.button')).nativeElement as HTMLElement;
    expect(button.textContent).toContain('test');
  });

  it('should display expand icons', () => {
    component.expandedComponent = TestComponent;
    fixture.detectChanges();
    const row: DebugElement = fixture.debugElement.query(By.css('.mat-row'));
    const expandIcon = row.query(By.css('.mat-icon')).nativeElement as HTMLElement;

    expect(expandIcon.textContent).toContain('expand_more');
  });

  it('should display custom button with a custom function', () => {
    let testRow: Run;

    const testFunction = (inputRow: Run): Observable<string> => {
      testRow = inputRow;
      return of('test');
    };

    const buttons: Button<Run>[] = [{ icon: 'add_circle', func: testFunction }];

    component.buttons = buttons;
    fixture.detectChanges();

    const row: DebugElement = fixture.debugElement.query(By.css('.mat-row'));
    const button = row.query(By.css('.mat-icon')).nativeElement as HTMLElement;

    button.click();

    expect(button.textContent).toContain('add_circle');
    expect(testRow).toEqual(runs[0]);
  });
});
