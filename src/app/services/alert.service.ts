import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrytonSnackbarAlertComponent } from '../modules/shared/components/cryton-snackbar-alert/cryton-snackbar-alert.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private _snackBar: MatSnackBar) {}

  showError(msg: string): void {
    this._showSnackbar(msg, 'error');
  }

  showWarning(msg: string): void {
    this._showSnackbar(msg, 'warning');
  }

  showSuccess(msg: string): void {
    this._showSnackbar(msg, 'success');
  }

  private _showSnackbar(message: string, type: string): void {
    this._snackBar.openFromComponent(CrytonSnackbarAlertComponent, {
      data: { message, type },
      duration: 5000
    });
  }
}
