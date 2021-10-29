import { Directive, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[appHoldClick]'
})
export class HoldClickDirective implements OnDestroy {
  destroy$ = new Subject<void>();

  constructor(private _element: ElementRef) {}

  @HostListener('mousedown') onMouseDown(): void {
    timer(500, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const nativeElement = this._element.nativeElement as HTMLElement;
        nativeElement.click();
      });
  }

  @HostListener('mouseup') onMouseUp(): void {
    this.destroy$.next();
  }

  @HostListener('mouseout') onMouseOut(): void {
    this.destroy$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
