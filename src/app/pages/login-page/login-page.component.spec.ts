import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  let inputs: DebugElement[];
  let passwordInput: HTMLInputElement;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LoginPageComponent],
        imports: [
          FormsModule,
          ReactiveFormsModule,
          MatInputModule,
          MatIconModule,
          MatCheckboxModule,
          BrowserAnimationsModule,
          MatFormFieldModule
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    inputs = fixture.debugElement.queryAll(By.css('input'));
    passwordInput = inputs[1].nativeElement as HTMLInputElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use input type="password" for password', () => {
    expect(passwordInput.type).toEqual('password');
  });

  it('should change input type to "text" on eye button click', () => {
    const eyeButton = fixture.debugElement.query(By.css('.mat-icon'));
    const eyeButtonElement = eyeButton.nativeElement as HTMLElement;

    eyeButtonElement.click();
    fixture.detectChanges();

    expect(passwordInput.type).toEqual('text');
  });
});
