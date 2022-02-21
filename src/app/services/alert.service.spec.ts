import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Spied } from '../testing/utility/utility-types';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  const matSnackbarStub = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']) as Spied<MatSnackBar>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: matSnackbarStub }]
    });
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
