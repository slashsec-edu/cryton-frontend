import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-counter',
  templateUrl: './cryton-counter.component.html',
  styleUrls: ['./cryton-counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonCounterComponent {
  @Input() name: string;
  @Input() count: number;

  constructor() {}
}
