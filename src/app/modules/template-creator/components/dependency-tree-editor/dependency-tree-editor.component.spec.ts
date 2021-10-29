import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { DependencyTreeEditorComponent } from './dependency-tree-editor.component';
import { SharedModule } from '../../../shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('DependencyTreeEditorComponent', () => {
  let component: DependencyTreeEditorComponent;
  let fixture: ComponentFixture<DependencyTreeEditorComponent>;

  const snackbar = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']) as MatSnackBar;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DependencyTreeEditorComponent],
        imports: [TemplateCreatorModule, SharedModule],
        providers: [{ provide: MatSnackBar, useValue: snackbar }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DependencyTreeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
