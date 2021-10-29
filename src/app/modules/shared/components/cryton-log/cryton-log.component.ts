import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-log',
  templateUrl: './cryton-log.component.html',
  styleUrls: ['./cryton-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonLogComponent implements OnInit {
  @Input() value: string;

  constructor() {}

  ngOnInit(): void {}
}
