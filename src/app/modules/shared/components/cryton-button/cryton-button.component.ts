import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cryton-button',
  templateUrl: './cryton-button.component.html',
  styleUrls: ['./cryton-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonButtonComponent {
  /**
   * Color of the button.
   */
  @Input() color?: string;

  /**
   * Icon rendered inside the button.
   */
  @Input() icon: string;

  /**
   * Value displayed inside the button.
   */
  @Input() value: string;

  /**
   * Specifies if button should be disabled.
   */
  @Input() disabled?: boolean;

  /**
   * Triggers when user clicks the button.
   */
  @Output() clicked = new EventEmitter<void>();

  constructor() {}

  /**
   * Triggers click event if button is not disabled.
   */
  handleClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
