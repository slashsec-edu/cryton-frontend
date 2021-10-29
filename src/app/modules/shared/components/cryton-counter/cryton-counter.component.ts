import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-cryton-counter',
  templateUrl: './cryton-counter.component.html',
  styleUrls: ['./cryton-counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonCounterComponent implements OnInit {
  @Input() name: string;
  @Input() count: number;

  constructor() {}

  ngOnInit(): void {}
}
