import { Component, OnInit } from '@angular/core';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';

@Component({
  selector: 'app-create-template',
  templateUrl: './create-template.component.html',
  styleUrls: ['./create-template.component.scss'],
  animations: [renderComponentTrigger]
})
export class CreateTemplateComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
