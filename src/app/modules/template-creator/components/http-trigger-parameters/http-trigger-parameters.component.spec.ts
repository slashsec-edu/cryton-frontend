import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpForm } from '../../classes/stage-creation/forms/http-form';

import { HttpTriggerParametersComponent } from './http-trigger-parameters.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

describe('HttpTriggerParametersComponent', () => {
  let component: HttpTriggerParametersComponent;
  let fixture: ComponentFixture<HttpTriggerParametersComponent>;

  const testTriggerForm = new HttpForm();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule
      ],
      declarations: [HttpTriggerParametersComponent]
    })
      .overrideComponent(HttpTriggerParametersComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpTriggerParametersComponent);
    component = fixture.componentInstance;

    component.triggerForm = testTriggerForm;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
