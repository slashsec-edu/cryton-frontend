import { EventEmitter } from '@angular/core';

export interface ExpandedRowInterface<T> {
  rowData: T;
  delete: EventEmitter<void>;
  rowUpdate: EventEmitter<T>;
}
