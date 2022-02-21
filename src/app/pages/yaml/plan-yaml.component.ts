import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { PlanService } from 'src/app/services/plan.service';
import { YamlPreview } from './yaml-preview';

@Component({
  selector: 'app-plan-yaml',
  templateUrl: './yaml-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanYamlComponent extends YamlPreview implements OnInit {
  itemName = 'plan';

  constructor(protected _route: ActivatedRoute, protected _planService: PlanService, protected _alert: AlertService) {
    super(_route, _planService, _alert);
  }

  ngOnInit(): void {
    this.fetchYaml();
  }
}
