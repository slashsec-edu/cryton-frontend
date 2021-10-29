import { AlertService } from 'src/app/services/alert.service';
import { Spied } from '../utility/utility-types';

export const alertServiceStub = jasmine.createSpyObj('AlertService', [
  'showError',
  'showSuccess',
  'showWarning'
]) as Spied<AlertService>;
