import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appFileUploadDnd]'
})
export class FileUploadDndDirective {
  @Output() fileDropped = new EventEmitter<FileList>();

  private _nativeElement: HTMLElement;

  constructor(private _element: ElementRef) {
    this._nativeElement = this._element.nativeElement as HTMLElement;
  }

  @HostListener('dragover', ['$event']) onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this._nativeElement.classList.add('active');
  }

  @HostListener('dragleave', ['$event']) onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._nativeElement.classList.remove('active');
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._nativeElement.classList.remove('active');

    const files = event.dataTransfer.files;

    if (files.length > 0) {
      this.fileDropped.emit(files);
    }
  }
}
