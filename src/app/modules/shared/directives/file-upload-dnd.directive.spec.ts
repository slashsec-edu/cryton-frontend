import { ElementRef } from '@angular/core';
import { FileUploadDndDirective } from './file-upload-dnd.directive';

describe('FileUploadDndDirective', () => {
  const elementSpy = jasmine.createSpyObj('ElementRef', [], ['nativeElement']) as ElementRef;

  it('should create an instance', () => {
    const directive = new FileUploadDndDirective(elementSpy);
    expect(directive).toBeTruthy();
  });
});
