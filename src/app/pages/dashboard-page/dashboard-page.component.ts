import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { renderComponentAnimation } from 'src/app/modules/shared/animations/render-component.animation';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  animations: [trigger('renderTrigger', [transition(':enter', [useAnimation(renderComponentAnimation)])])]
})
export class DashboardPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
