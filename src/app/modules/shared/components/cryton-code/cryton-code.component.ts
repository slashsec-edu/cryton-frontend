import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-cryton-code',
  templateUrl: './cryton-code.component.html',
  styleUrls: ['./cryton-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonCodeComponent implements OnInit {
  @Input() code: string;

  constructor() {}

  ngOnInit(): void {}

  copy(): void {}
}
