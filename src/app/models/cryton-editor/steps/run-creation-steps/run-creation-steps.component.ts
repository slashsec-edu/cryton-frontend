import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, DebugElement, QueryList } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { WorkerTableDataSource } from 'src/app/models/data-sources/worker-table.data-source';
import { WorkerInventoriesDataSource } from 'src/app/models/data-sources/worker-inventories.data-source';
import { PlanService } from 'src/app/services/plan.service';
import { WorkersService } from 'src/app/services/workers.service';
import { WorkerInventoriesService } from 'src/app/services/worker-inventories.service';
import { RunService } from 'src/app/services/run.service';
import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { Plan } from '../../../api-responses/plan.interface';
import { Worker } from '../../../api-responses/worker.interface';
import { Selectable } from '../../../cryton-editor/interfaces/selectable.interface';
import { Column } from '../../../cryton-table/interfaces/column.interface';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';
import { TableButton } from 'src/app/modules/shared/components/cryton-table/buttons/table-button';
import { CustomActionButton } from 'src/app/modules/shared/components/cryton-table/buttons/custom-action-button';
import { MatDialog } from '@angular/material/dialog';
import { CrytonInventoryCreatorComponent } from 'src/app/modules/shared/components/cryton-inventory-creator/cryton-inventory-creator.component';
import { catchError, first, mapTo, tap } from 'rxjs/operators';
import { parse, stringify } from 'yaml';

@Component({
  selector: 'app-run-creation-steps',
  templateUrl: './run-creation-steps.component.html'
})
export class RunCreationStepsComponent extends CrytonEditorStepsComponent implements OnInit, OnDestroy {
  @ViewChild('inventoryTable', { static: true }) inventoryTable: CrytonTableComponent<Worker>;
  @ViewChildren('fileInput') fileInputs: QueryList<DebugElement>;

  planDataSource: PlanTableDataSource;
  workerDataSource: WorkerTableDataSource;
  inventoriesDataSource: WorkerInventoriesDataSource;

  buttons: TableButton[];
  workers: Worker[];
  plan: Plan;
  executionVariables: Record<number, File[] | string> = {};

  constructor(
    private _planService: PlanService,
    private _workersService: WorkersService,
    private _runService: RunService,
    private _workerInventoriesService: WorkerInventoriesService,
    private _dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.planDataSource = new PlanTableDataSource(this._planService);
    this.workerDataSource = new WorkerTableDataSource(this._workersService);
    this.inventoriesDataSource = new WorkerInventoriesDataSource(this._workerInventoriesService);
    this.buttons = [
      new CustomActionButton('Clear variables', 'clear', this._clearSelection),
      new CustomActionButton('Upload variables', 'backup', this._uploadFile),
      new CustomActionButton('Create variables', 'description', this._createVariables)
    ];
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  erase(): void {
    this.workers = null;
    this.plan = null;
    this.executionVariables = {};
  }

  /**
   * Updates plan selected in the 1. step.
   *
   * @param plan Selected plan.
   */
  setPlan(plan: Plan): void {
    this.plan = plan;
    this.emitSelectables([{ name: plan.name, id: plan.id }]);
  }

  /**
   * Updates workers selected in the 2. step.
   *
   * @param workers Set of selected workers.
   */
  setWorkers(workers: Worker[]): void {
    this.workers = workers;

    // Updating workers in the 3. step and reloading the table.
    this._workerInventoriesService.setWorkers(workers);
    this.inventoryTable.loadPage();

    this.emitSelectables(
      Array.from(workers).map((worker: Worker) => ({ name: worker.name, id: worker.id } as Selectable))
    );
  }

  /**
   * Takes a FileList from file input and assigns the files to a corresponding worker. Then emits an
   * inputChange event with all the selected files.
   *
   * @param changeEvent Event triggered on input change.
   * @param worker Worker linked to file input.
   */
  setFiles(changeEvent: Event, worker: Worker): void {
    const files = (changeEvent.target as HTMLInputElement).files;
    this.executionVariables[worker.id] = Array.from(files);

    this.emitSelection();
  }

  setYaml(yaml: string, worker: Worker): void {
    this.executionVariables[worker.id] = yaml;
    this.emitSelection();
  }

  /**
   * Emits selectables of currently selected execution variables.
   */
  emitSelection(): void {
    const selectables = Object.entries(this.executionVariables).reduce(
      (resultArray, item: [string, File[] | string]) => {
        let variables: Selectable[];

        if (Array.isArray(item[1])) {
          variables = item[1].map((file: File) => ({ name: file.name, id: Number(item[0]) } as Selectable));
        } else if (item[1]) {
          variables = Object.entries(parse(item[1])).map((entry: [string, string]) => ({
            name: `${entry[0]}: ${stringify(entry[1])}`,
            id: Number(item[0])
          }));
        }
        return (variables ? resultArray.concat(variables) : resultArray) as Selectable[];
      },
      []
    );
    this.emitSelectables(selectables);
  }

  /**
   * Returns an array of workers sorted by ID.
   */
  workersArray(): Worker[] {
    if (this.workers) {
      return Array.from(this.workers).sort((a: Worker, b: Worker) => a.id - b.id);
    }
    return [];
  }

  protected createPostRequest(): void {
    let workers: string[] = [];
    if (this.workers) {
      workers = Array.from(this.workers).map(item => item.id.toString());
    }

    const runPostRequest = {
      plan_model: this.plan.id,
      workers
    };

    this.create.emit(this._runService.postRun(runPostRequest, this.executionVariables));
  }

  private _createVariables = (row: Worker): Observable<string> => {
    const workersVariables = this.executionVariables[row.id];
    const variablesDialog = this._dialog.open(CrytonInventoryCreatorComponent, {
      data: { inventory: this._isFileInventory(workersVariables) ? null : workersVariables }
    });

    return variablesDialog.afterClosed().pipe(
      first(),
      tap((variables: string) => {
        if (variables) {
          this.setYaml(variables, row);
        }
      }),
      mapTo(''),
      catchError(() => throwError('Execution variable creation failed.'))
    );
  };

  /**
   * Function for opening a file input window.
   * Function is attached to upload button in the cryton table of the third step.
   *
   * @param row Row data of the row in which the button was clicked.
   */
  private _uploadFile = (row: Worker): Observable<string> => {
    const rowInput = this._findRowInput(row);

    rowInput.click();
    return of(null) as Observable<string>;
  };

  private _clearSelection = (row: Worker): Observable<string> => {
    console.log(this.executionVariables);

    const rowInput = this._findRowInput(row);
    rowInput.value = null;
    this.executionVariables[row.id] = null;
    this.emitSelection();
    console.log(this.executionVariables);

    return of(null) as Observable<string>;
  };

  /**
   * Finds an input for execution variable files by a given row data.
   *
   * @param row Worker data.
   * @returns Debug element of file input.
   */
  private _findRowInput(row: Worker): HTMLInputElement {
    const rowInput = this.fileInputs.find(input => {
      const inputElement = input.nativeElement as HTMLElement;
      return inputElement.id === row.id.toString();
    });

    if (rowInput) {
      return rowInput.nativeElement as HTMLInputElement;
    }
  }

  private _isFileInventory(inventory: string | File[]): boolean {
    return Array.isArray(inventory);
  }
}

/**
 * Simplified plan table data source with less columns.
 */
export class PlanTableDataSource extends CrytonTableDataSource<Plan> {
  columns: Column[] = [
    {
      name: 'id',
      display: 'ID',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'name',
      display: 'NAME',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'owner',
      display: 'OWNER',
      highlight: false,
      filterable: true,
      sortable: true
    }
  ];
  displayFunctions = null;
  highlightDictionary = {};

  constructor(protected planService: PlanService) {
    super(planService);
  }
}
