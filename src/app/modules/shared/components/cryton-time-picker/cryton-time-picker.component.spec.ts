import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrytonTimePickerComponent } from './cryton-time-picker.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

describe('CrytonTimePickerComponent', () => {
  let component: CrytonTimePickerComponent;
  let fixture: ComponentFixture<CrytonTimePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrytonTimePickerComponent],
      imports: [MatIconModule, FormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonTimePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
