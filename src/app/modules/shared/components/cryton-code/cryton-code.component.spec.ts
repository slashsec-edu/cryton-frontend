import { ClipboardModule } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { CrytonCodeComponent } from './cryton-code.component';

describe('CrytonCodeComponent', () => {
  let component: CrytonCodeComponent;
  let fixture: ComponentFixture<CrytonCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrytonCodeComponent],
      imports: [ClipboardModule, MatIconModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
