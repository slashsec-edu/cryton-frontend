import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FILL_MAP } from '../../classes/report-constants';

interface ColorGroup {
  color: string;
  states: string[];
}

@Component({
  selector: 'app-report-timeline-help',
  templateUrl: './report-timeline-help.component.html',
  styleUrls: ['./report-timeline-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportTimelineHelpComponent implements OnInit {
  colorGroups: ColorGroup[];

  constructor() {}

  ngOnInit(): void {
    this.colorGroups = this._buildColorGroups(FILL_MAP);
  }

  private _buildColorGroups(colorMap: Record<string, string>): ColorGroup[] {
    const colorGroups: ColorGroup[] = [];

    Object.entries(colorMap).forEach((entry: [string, string]) => {
      const group = colorGroups.find(currentGroup => currentGroup.color === entry[1]);

      if (group) {
        group.states.push(entry[0]);
      } else {
        colorGroups.push({ color: entry[1], states: [entry[0]] });
      }
    });

    return colorGroups;
  }
}
