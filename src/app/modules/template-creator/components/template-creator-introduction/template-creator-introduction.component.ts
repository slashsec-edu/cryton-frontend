import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-template-creator-introduction',
  templateUrl: './template-creator-introduction.component.html',
  styleUrls: ['./template-creator-introduction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCreatorIntroductionComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
