import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { RunService } from 'src/app/services/run.service';
import { YamlPreview } from './yaml-preview';

@Component({
  selector: 'app-run-yaml-preview',
  templateUrl: './yaml-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunYamlPreviewComponent extends YamlPreview implements OnInit {
  itemName = 'run';

  constructor(protected _route: ActivatedRoute, protected _runService: RunService, protected _alert: AlertService) {
    super(_route, _runService, _alert);
  }

  ngOnInit(): void {
    this.fetchYaml();
  }
}
