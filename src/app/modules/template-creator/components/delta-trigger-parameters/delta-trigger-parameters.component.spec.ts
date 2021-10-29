import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeltaForm } from '../../classes/stage-creation/forms/delta-form';

import { DeltaTriggerParametersComponent } from './delta-trigger-parameters.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DeltaTriggerParametersComponent', () => {
  let component: DeltaTriggerParametersComponent;
  let fixture: ComponentFixture<DeltaTriggerParametersComponent>;

  const testTriggerForm = new DeltaForm();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatFormFieldModule, FormsModule, ReactiveFormsModule, MatInputModule, BrowserAnimationsModule],
      declarations: [DeltaTriggerParametersComponent]
    })
      .overrideComponent(DeltaTriggerParametersComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeltaTriggerParametersComponent);
    component = fixture.componentInstance;
    component.triggerForm = testTriggerForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
