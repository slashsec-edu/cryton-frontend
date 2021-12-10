import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-id-chip',
  templateUrl: './cryton-id-chip.component.html',
  styleUrls: ['./cryton-id-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonIdChipComponent {
  @Input() id: number;
  @Input() name: string;

  constructor() {}
}
