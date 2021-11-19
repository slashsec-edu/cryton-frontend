import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';
import { Template } from '../../models/api-responses/template.interface';
import { Column } from '../cryton-table/interfaces/column.interface';

export class TemplatesTableDataSource extends CrytonTableDataSource<Template> {
  columns: Column[] = [
    {
      name: 'id',
      display: 'ID',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'file',
      display: 'FILE',
      highlight: false,
      filterable: true,
      sortable: true
    }
  ];
  displayFunctions = [];
  highlightDictionary = {};
}
