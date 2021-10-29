import { ElementRef } from '@angular/core';
import { HoldClickDirective } from './hold-click.directive';

describe('HoldClickDirective', () => {
  const elementSpy = jasmine.createSpyObj('ElementRef', [], ['nativeElement']) as ElementRef;

  it('should create an instance', () => {
    const directive = new HoldClickDirective(elementSpy);
    expect(directive).toBeTruthy();
  });
});
