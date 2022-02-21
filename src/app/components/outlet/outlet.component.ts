import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutletComponent {
  constructor() {}
}
