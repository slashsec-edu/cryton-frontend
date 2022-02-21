import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { CrytonButtonComponent } from './cryton-button.component';

describe('CrytonButtonComponent', () => {
  let component: CrytonButtonComponent;
  let fixture: ComponentFixture<CrytonButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonButtonComponent],
        imports: [MatButtonModule, MatIconModule]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonButtonComponent);
    component = fixture.componentInstance;
    component.value = 'testing';
    component.color = 'warn';
    component.icon = 'add_circle';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "testing" inside the button', () => {
    const button = fixture.debugElement.query(By.css('.button')).nativeElement as HTMLElement;
    expect(button.textContent).toContain('testing');
  });

  it('should have color equal to "warn"', () => {
    const button: DebugElement = fixture.debugElement.query(By.css('button'));
    expect(button.attributes['ng-reflect-color']).toEqual('warn');
  });

  it('shuld emit clicked event on click', () => {
    spyOn(component.clicked, 'emit');
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
    button.click();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should be unclickable when disabled', () => {
    spyOn(component.clicked, 'emit');
    component.disabled = true;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLElement;
    button.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });

  it('should display add_circle material icon', () => {
    const icon = fixture.debugElement.query(By.css('.mat-icon')).nativeElement as HTMLElement;
    expect(icon.textContent.trim()).toEqual('add_circle');
  });
});
