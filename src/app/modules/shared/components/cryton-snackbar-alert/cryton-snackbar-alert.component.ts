import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Alert } from '../../models/interfaces/alert.interface';

@Component({
  selector: 'app-snackbar-alert',
  templateUrl: './cryton-snackbar-alert.component.html',
  styleUrls: ['./cryton-snackbar-alert.component.scss']
})
export class CrytonSnackbarAlertComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: Alert) {}

  getAlertIcon(alertType: string): string {
    switch (alertType) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      default:
        break;
    }
  }
}
