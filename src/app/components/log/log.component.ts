/* eslint-disable max-len */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogComponent implements OnInit {
  logText = {
    queue: 'cryton_core.control.request',
    event: 'Queue declared and consuming',
    logger: 'cryton-debug',
    level: 'info',
    timestamp: '2021-05-18T11:19:20.012152Z'
  } as Record<string, any>;

  constructor() {}

  ngOnInit(): void {}
}
