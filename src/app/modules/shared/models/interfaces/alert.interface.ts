import { AlertType } from '../types/alert.type';

export interface Alert {
  type: AlertType;
  message: string;
}
