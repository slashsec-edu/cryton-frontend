import { Column } from '../models/cryton-table/interfaces/column.interface';
import { HasID } from '../models/cryton-table/interfaces/has-id.interface';
import { TableDataSource } from './table.datasource';

export abstract class CrytonTableDataSource<T extends HasID> extends TableDataSource<T> {
  abstract displayFunctions: ((input: T) => string)[];
  abstract highlightDictionary: Record<string, string>;
  abstract columns: Column[];

  /**
   * Finds a color matching the table cell value in the highlight
   * dictionary and returns it.
   *
   * @param cell Table cell.
   */
  getHighlight(cell: string): string {
    const highlight = this.highlightDictionary[cell];
    return highlight ? highlight : null;
  }
}
