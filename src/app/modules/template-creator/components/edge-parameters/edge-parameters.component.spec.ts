import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Spied } from 'src/app/testing/utility/utility-types';
import { CrytonStepEdge } from '../../classes/cryton-edge/cryton-step-edge';
import { CrytonStep } from '../../classes/cryton-node/cryton-step';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { TemplateCreatorModule } from '../../template-creator.module';
import { EdgeParametersComponent } from './edge-parameters.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EdgeParametersComponent', () => {
  let component: EdgeParametersComponent;
  let fixture: ComponentFixture<EdgeParametersComponent>;

  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) as Spied<
    MatDialogRef<EdgeParametersComponent>
  >;
  const fakeAfterClosed$ = new Subject<void>();

  // Now we can fake closing action of dialog.
  dialogRefSpy.afterClosed.and.returnValue(fakeAfterClosed$.asObservable());

  // Dependency tree is needed only for providing theme.
  const mockDepTree = { theme: null } as DependencyTree;
  const mockParentStep = new CrytonStep('parent', 'parent', 'parent', mockDepTree);
  const mockChildStep = new CrytonStep('child', 'child', 'child', mockDepTree);
  const mockTreeEdge = new CrytonStepEdge(mockDepTree, mockParentStep);
  mockTreeEdge.childNode = mockChildStep;

  const dialogDataSpy = jasmine.createSpyObj('MAT_DIALOG_DATA', [], { edge: mockTreeEdge }) as Spied<{
    edge: CrytonStepEdge;
  }>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateCreatorModule, BrowserAnimationsModule],
      declarations: [EdgeParametersComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdgeParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
