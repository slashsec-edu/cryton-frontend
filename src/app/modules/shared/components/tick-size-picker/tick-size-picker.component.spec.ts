import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TickSizePickerComponent } from './tick-size-picker.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TickSizePickerComponent', () => {
  let component: TickSizePickerComponent;
  let fixture: ComponentFixture<TickSizePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      declarations: [TickSizePickerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TickSizePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
