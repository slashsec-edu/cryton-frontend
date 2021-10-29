import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Spied } from 'src/app/testing/utility/utility-types';

import { TimelineComponent } from './timeline.component';
import { TickSizePickerComponent } from 'src/app/modules/shared/components/tick-size-picker/tick-size-picker.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open']) as Spied<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatSelectModule,
        MatButtonModule
      ],
      declarations: [TimelineComponent, TickSizePickerComponent, CrytonButtonComponent],
      providers: [{ provide: MatDialog, useValue: matDialogStub }]
    })
      .overrideComponent(TimelineComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
