import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { TableButton } from './table-button';

export class LinkButton extends TableButton {
  icon: string;
  name: string;
  pathTemplate: string;

  constructor(name: string, icon: string, pathTemplate: string) {
    super();
    this.name = name;
    this.icon = icon;
    this.pathTemplate = pathTemplate;
  }

  constructPath(row: HasID): string {
    return this.pathTemplate.replace(':id', row.id.toString());
  }
}
