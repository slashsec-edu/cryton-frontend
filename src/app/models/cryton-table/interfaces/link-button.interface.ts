import { TableButton } from './table-button.interface';

export interface LinkButton<T> extends TableButton {
  constructLink: (row: T) => string;
}
