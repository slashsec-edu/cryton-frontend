import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dependency-tree-help',
  templateUrl: './dependency-tree-help.component.html',
  styleUrls: ['./dependency-tree-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyTreeHelpComponent {
  constructor() {}
}
