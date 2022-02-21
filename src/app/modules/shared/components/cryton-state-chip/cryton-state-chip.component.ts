import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-state-chip',
  templateUrl: './cryton-state-chip.component.html',
  styleUrls: ['./cryton-state-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonStateChipComponent {
  @Input() state: string;

  constructor() {}
}
