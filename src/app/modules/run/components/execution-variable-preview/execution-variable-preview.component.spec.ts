import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ExecutionVariablePreviewComponent } from './execution-variable-preview.component';

describe('ExecutionVariablePreviewComponent', () => {
  let component: ExecutionVariablePreviewComponent;
  let fixture: ComponentFixture<ExecutionVariablePreviewComponent>;

  const mockVariable = { variable: { name: 'test', value: 'test' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule, MatDividerModule],
      declarations: [ExecutionVariablePreviewComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: mockVariable }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionVariablePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
