import { AfterViewInit, Component, DebugElement, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-konva-container',
  template: `<div #konvaContainer style="width: 500px; height: 500px;"></div>`
})
export class KonvaContainerComponent implements AfterViewInit {
  @ViewChild('konvaContainer') konvaContainer: DebugElement;
  @Input() afterInit: () => void;

  constructor() {}

  ngAfterViewInit(): void {
    this.afterInit();
  }
}
