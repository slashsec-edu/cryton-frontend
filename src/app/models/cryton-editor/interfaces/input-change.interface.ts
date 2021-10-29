import { Selectable } from './selectable.interface';

export interface InputChange {
  selectables: Selectable[];
  completion: boolean;
}
