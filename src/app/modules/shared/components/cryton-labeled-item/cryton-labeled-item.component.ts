import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-labeled-item',
  templateUrl: './cryton-labeled-item.component.html',
  styleUrls: ['./cryton-labeled-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonLabeledItemComponent {
  @Input() label: string;

  constructor() {}
}
