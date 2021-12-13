import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnableTab]'
})
export class EnableTabDirective {
  constructor(private _ref: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();

      if (this._ref.nativeElement instanceof HTMLTextAreaElement) {
        this._textareaHandler(this._ref.nativeElement);
      } else {
        this._contentEditableHandler(this._ref.nativeElement);
      }
    }
  }

  private _textareaHandler(element: HTMLTextAreaElement): void {
    const start = element.selectionStart;
    const end = element.selectionEnd;

    element.value = element.value.substring(0, start) + '  ' + element.value.substring(end);
    element.selectionStart = element.selectionEnd = start + 2;
  }

  private _contentEditableHandler(element: HTMLElement): void {
    const doc = element.ownerDocument.defaultView;
    const sel = doc.getSelection();
    const range = sel.getRangeAt(0);

    const tabNode = document.createTextNode('  ');
    range.insertNode(tabNode);

    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
