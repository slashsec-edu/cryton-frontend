import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkAccordionItem } from '@angular/cdk/accordion';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChildren } from '@angular/core';
import { StepExecutionReport } from 'src/app/models/api-responses/report/step-execution-report.interface';

type Output = { name: string; content: string };

@Component({
  selector: 'app-step-report-card',
  templateUrl: './step-report-card.component.html',
  styleUrls: ['./step-report-card.component.scss', '../../styles/report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expansion', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('0.2s ease'))
    ])
  ]
})
export class StepReportCardComponent implements OnInit {
  @ViewChildren(CdkAccordionItem) results: CdkAccordionItem[];
  @Input() step: StepExecutionReport;
  outputs: Output[];

  constructor() {}

  ngOnInit(): void {
    this.outputs = this._getOutputs();
  }

  getExpandedState(expanded: boolean): string {
    return expanded ? 'expanded' : 'collapsed';
  }

  masterToggle(): void {
    const areAllOpen = [...this.results].every(result => result.expanded);

    if (areAllOpen) {
      this.results.forEach(result => result.close());
    } else {
      this.results.forEach(result => result.open());
    }
  }

  private _getOutputs(): Output[] {
    return [
      {
        name: 'Standard output',
        content: this.step.std_out ?? 'NONE'
      },
      {
        name: 'Standard error output',
        content: this.step.std_err ?? 'NONE'
      },
      {
        name: 'Module output',
        content: JSON.stringify(this.step.mod_out) ?? 'NONE'
      },
      {
        name: 'Module error output',
        content: this.step.mod_err ?? 'NONE'
      },
      {
        name: 'Result',
        content: this.step.result ?? 'NONE'
      }
    ];
  }
}
