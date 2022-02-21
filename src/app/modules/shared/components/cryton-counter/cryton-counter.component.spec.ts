import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CrytonCounterComponent } from './cryton-counter.component';

describe('CrytonCounterComponent', () => {
  let component: CrytonCounterComponent;
  let fixture: ComponentFixture<CrytonCounterComponent>;
  let spanElement: HTMLSpanElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonCounterComponent]
      })
        .overrideComponent(CrytonCounterComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spanElement = fixture.debugElement.query(By.css('.cryton-counter--counter')).nativeElement as HTMLSpanElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display number 42', () => {
    const testingNumber = 42;
    component.count = testingNumber;
    fixture.detectChanges();

    expect(spanElement.textContent).toContain('42');
  });

  it('should have name "Total"', () => {
    component.name = 'Total';
    fixture.detectChanges();

    expect(spanElement.textContent).toContain('Total');
  });
});
