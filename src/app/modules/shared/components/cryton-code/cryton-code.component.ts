import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-code',
  templateUrl: './cryton-code.component.html',
  styleUrls: ['./cryton-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonCodeComponent {
  @Input() code: string;

  constructor() {}
}
