import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { TemplateService } from 'src/app/services/template.service';
import { YamlPreview } from './yaml-preview';

@Component({
  selector: 'app-template-yaml',
  templateUrl: './yaml-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateYamlComponent extends YamlPreview implements OnInit {
  itemName = 'template';
  pluckArgs = ['detail', 'template'];

  constructor(
    protected _route: ActivatedRoute,
    protected _templateService: TemplateService,
    protected _alert: AlertService
  ) {
    super(_route, _templateService, _alert);
  }

  ngOnInit(): void {
    this.fetchYaml();
  }
}
