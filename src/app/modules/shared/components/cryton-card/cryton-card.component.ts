import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';

@Component({
  selector: 'app-cryton-card',
  templateUrl: './cryton-card.component.html',
  styleUrls: ['./cryton-card.component.scss'],
  animations: [renderComponentTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonCardComponent {
  /**
   * Enables render component animation.
   */
  @Input() enableAnimation = true;

  /**
   * Removes padding inside mat card.
   */
  @Input() noPadding = false;

  /**
   * Removes colored top border.
   */
  @Input() noBorder = false;

  constructor() {}
}
