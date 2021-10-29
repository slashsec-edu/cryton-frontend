import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnableTab]'
})
export class EnableTabDirective {
  constructor(private _ref: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    const element = this._ref.nativeElement as HTMLTextAreaElement;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = element.selectionStart;
      const end = element.selectionEnd;

      element.value = element.value.substring(0, start) + '  ' + element.value.substring(end);
      element.selectionStart = element.selectionEnd = start + 2;
    }
  }
}
