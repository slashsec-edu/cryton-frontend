import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutletComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
