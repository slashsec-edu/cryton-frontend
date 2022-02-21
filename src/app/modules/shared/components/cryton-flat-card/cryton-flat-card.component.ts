import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-flat-card',
  templateUrl: './cryton-flat-card.component.html',
  styleUrls: ['./cryton-flat-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonFlatCardComponent {
  @Input() noMargin = false;
  @Input() noPadding = false;

  constructor() {}
}
