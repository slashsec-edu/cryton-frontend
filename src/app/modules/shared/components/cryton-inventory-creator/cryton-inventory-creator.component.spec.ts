import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Spied } from 'src/app/testing/utility/utility-types';
import { CrytonInventoryCreatorComponent } from './cryton-inventory-creator.component';

describe('CrytonInventoryCreatorComponent', () => {
  let component: CrytonInventoryCreatorComponent;
  let fixture: ComponentFixture<CrytonInventoryCreatorComponent>;

  const dialogRefStub = jasmine.createSpyObj('MatDialogRef', ['close']) as Spied<
    MatDialogRef<CrytonInventoryCreatorComponent>
  >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrytonInventoryCreatorComponent],
      imports: [
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonInventoryCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
