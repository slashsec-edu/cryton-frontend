import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent {
  hidePassword = true;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false)
  });

  constructor() {}

  login(): void {
    const formValue = this.loginForm.value as Record<string, string>;
    console.log(
      `username: ${formValue.username as string}\n
       password: ${formValue.password as string}\n
       remember: ${formValue.remember as string}`
    );
  }
}
