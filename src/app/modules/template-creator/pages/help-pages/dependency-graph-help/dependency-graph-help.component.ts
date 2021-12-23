import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dependency-graph-help',
  templateUrl: './dependency-graph-help.component.html',
  styleUrls: ['./dependency-graph-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyGraphHelpComponent {
  constructor() {}
}
