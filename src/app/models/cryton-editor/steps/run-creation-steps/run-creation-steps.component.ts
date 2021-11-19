import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, DebugElement, QueryList } from '@angular/core';
import { Observable, of } from 'rxjs';

import { WorkerTableDataSource } from 'src/app/models/data-sources/worker-table.data-source';
import { WorkerInventoriesDataSource } from 'src/app/models/data-sources/worker-inventories.data-source';

import { InstanceService } from 'src/app/services/instance.service';
import { WorkersService } from 'src/app/services/workers.service';
import { WorkerInventoriesService } from 'src/app/services/worker-inventories.service';
import { RunService } from 'src/app/services/run.service';

import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';

import { Instance } from '../../../api-responses/instance.interface';
import { Worker } from '../../../api-responses/worker.interface';
import { Selectable } from '../../../cryton-editor/interfaces/selectable.interface';
import { Button } from '../../../cryton-table/interfaces/button.interface';
import { Column } from '../../../cryton-table/interfaces/column.interface';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';

@Component({
  selector: 'app-run-creation-steps',
  templateUrl: './run-creation-steps.component.html'
})
export class RunCreationStepsComponent extends CrytonEditorStepsComponent implements OnInit, OnDestroy {
  @ViewChild('inventoryTable', { static: true }) inventoryTable: CrytonTableComponent<Worker>;
  @ViewChildren('fileInput') fileInputs: QueryList<DebugElement>;

  instanceDataSource: InstanceTableDataSource;
  workerDataSource: WorkerTableDataSource;
  inventoriesDataSource: WorkerInventoriesDataSource;

  inventoriesButtons: Button<Worker>[];
  workers: Worker[];
  instance: Instance;
  inventoryFiles: Record<number, File[]> = {};

  constructor(
    private _instanceService: InstanceService,
    private _workersService: WorkersService,
    private _runService: RunService,
    private _workerInventoriesService: WorkerInventoriesService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.instanceDataSource = new InstanceTableDataSource(this._instanceService);
    this.workerDataSource = new WorkerTableDataSource(this._workersService);
    this.inventoriesDataSource = new WorkerInventoriesDataSource(this._workerInventoriesService);

    this.inventoriesButtons = [{ icon: 'backup', func: this.uploadFile }];
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  erase(): void {
    this.workers = null;
    this.instance = null;
    this.inventoryFiles = {};
  }

  /**
   * Updates instance selected in the 1. step.
   *
   * @param instance Selected instance.
   */
  setInstance(instance: Instance): void {
    this.instance = instance;
    this.emitSelectables([{ name: instance.name, id: instance.id }]);
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
   * Function for opening a file input window.
   * Function is attached to upload button in the cryton table of the third step.
   *
   * @param row Row data of the row in which the button was clicked.
   */
  uploadFile = (row: Worker): Observable<string> => {
    const rowInput: DebugElement = this.fileInputs.find(input => {
      const inputElement = input.nativeElement as HTMLElement;
      return inputElement.id === row.id.toString();
    });

    const rowInputElement = rowInput.nativeElement as HTMLElement;
    rowInputElement.click();
    return of(null) as Observable<string>;
  };

  /**
   * Takes a FileList from file input and assigns the files to a corresponding worker. Then emits an
   * inputChange event with all the selected files.
   *
   * @param changeEvent Event triggered on input change.
   * @param workerId ID of worker linked to file input.
   */
  setFiles(changeEvent: Event, workerId: number): void {
    const files = (changeEvent.target as HTMLInputElement).files;

    if (this.inventoryFiles[workerId]) {
      this.inventoryFiles[workerId].concat(Array.from(files));
    } else {
      this.inventoryFiles[workerId] = Array.from(files);
    }

    // Flattens the array of files and emits inputChange event.
    const selectables = Object.entries(this.inventoryFiles).reduce((resultArray, item: [string, File[]]) => {
      const mappedFiles = item[1].map((file: File) => ({ name: file.name, id: parseInt(item[0], 10) } as Selectable));
      return resultArray.concat(mappedFiles) as Selectable[];
    }, []);
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
      plan_model: this.instance.id,
      workers
    };

    this.create.emit(this._runService.postRun(runPostRequest, this.inventoryFiles));
  }
}

/**
 * Simplified instance table data source with less columns.
 */
export class InstanceTableDataSource extends CrytonTableDataSource<Instance> {
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

  constructor(protected instanceService: InstanceService) {
    super(instanceService);
  }
}
