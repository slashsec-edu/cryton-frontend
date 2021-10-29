import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrytonLogComponent } from './cryton-log.component';

describe('CrytonLogComponent', () => {
  let component: CrytonLogComponent;
  let fixture: ComponentFixture<CrytonLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrytonLogComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
