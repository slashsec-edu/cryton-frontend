import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-log',
  templateUrl: './cryton-log.component.html',
  styleUrls: ['./cryton-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonLogComponent {
  @Input() value: string;

  constructor() {}
}
