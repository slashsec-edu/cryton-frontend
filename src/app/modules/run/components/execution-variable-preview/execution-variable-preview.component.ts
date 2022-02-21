import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExecutionVariable } from 'src/app/models/api-responses/execution-variable.interface';
import { parse, stringify } from 'yaml';

@Component({
  selector: 'app-execution-variable-preview',
  templateUrl: './execution-variable-preview.component.html',
  styleUrls: ['./execution-variable-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionVariablePreviewComponent {
  data: { variable: ExecutionVariable };
  yamlValue: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: { variable: ExecutionVariable }) {
    this.data = data;
    this.yamlValue = stringify(parse(data.variable.value));
  }
}
