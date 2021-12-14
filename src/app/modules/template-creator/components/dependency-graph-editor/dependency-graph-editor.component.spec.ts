import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { DependencyGraphEditorComponent } from './dependency-graph-editor.component';
import { SharedModule } from '../../../shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('DependencyGraphEditorComponent', () => {
  let component: DependencyGraphEditorComponent;
  let fixture: ComponentFixture<DependencyGraphEditorComponent>;

  const snackbar = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']) as MatSnackBar;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DependencyGraphEditorComponent],
        imports: [TemplateCreatorModule, SharedModule],
        providers: [{ provide: MatSnackBar, useValue: snackbar }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DependencyGraphEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
