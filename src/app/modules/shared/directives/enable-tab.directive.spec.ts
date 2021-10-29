import { ElementRef } from '@angular/core';
import { EnableTabDirective } from './enable-tab.directive';

describe('EnableTabDirective', () => {
  const ref = jasmine.createSpyObj('ElementRef', [], ['nativeElement']) as ElementRef;

  it('should create an instance', () => {
    const directive = new EnableTabDirective(ref);
    expect(directive).toBeTruthy();
  });
});
