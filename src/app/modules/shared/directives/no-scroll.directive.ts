import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoScroll]'
})
export class NoScrollDirective {
  constructor() {}

  @HostListener('mousewheel', ['$event'])
  onMouseWheel(e: WheelEvent): void {
    e.preventDefault();
  }

  @HostListener('DOMMouseScroll', ['$event'])
  onDOMScroll(e: WheelEvent): void {
    e.preventDefault();
  }
}
