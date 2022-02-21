import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { PostponeRunComponent } from './postpone-run.component';

describe('PostponeRunComponent', () => {
  let component: PostponeRunComponent;
  let fixture: ComponentFixture<PostponeRunComponent>;

  const dialogRefStub = {
    afterClosed: of(null)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostponeRunComponent],
      imports: [MatDialogModule, MatDividerModule, SharedModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRefStub }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostponeRunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
