import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appComponentHost]'
})
export class ComponentInputDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
