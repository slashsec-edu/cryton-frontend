import { Component, EventEmitter } from '@angular/core';
import { ExpandedRowInterface } from 'src/app/generics/expanded-row.interface';
import { Run } from 'src/app/models/api-responses/run.interface';

@Component({
  selector: 'app-test',
  template: '<h1>Testing Component</h1>'
})
export class TestComponent implements ExpandedRowInterface<Run> {
  rowData: Run;
  delete = new EventEmitter<void>();
  rowUpdate = new EventEmitter<Run>();

  constructor() {}
}
