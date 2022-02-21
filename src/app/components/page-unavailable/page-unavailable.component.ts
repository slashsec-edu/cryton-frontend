import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-unavailable',
  templateUrl: './page-unavailable.component.html',
  styleUrls: ['./page-unavailable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageUnavailableComponent {
  constructor() {}
}
