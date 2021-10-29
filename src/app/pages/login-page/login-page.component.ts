import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  hidePassword = true;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false)
  });

  constructor() {}

  ngOnInit(): void {}

  login(): void {
    const formValue = this.loginForm.value as Record<string, any>;
    console.log(
      `username: ${formValue.username as string}\n
       password: ${formValue.password as string}\n
       remember: ${formValue.remember as string}`
    );
  }
}
