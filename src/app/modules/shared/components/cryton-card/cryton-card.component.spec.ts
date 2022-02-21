import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrytonCardComponent } from './cryton-card.component';

describe('CrytonCardComponent', () => {
  let component: CrytonCardComponent;
  let fixture: ComponentFixture<CrytonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrytonCardComponent],
      imports: [BrowserAnimationsModule, MatCardModule]
    })
      .overrideComponent(CrytonCardComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
