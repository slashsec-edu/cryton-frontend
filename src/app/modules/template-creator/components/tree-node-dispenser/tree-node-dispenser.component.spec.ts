import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TreeNodeDispenserComponent } from './tree-node-dispenser.component';
import { TemplateCreatorModule } from '../../template-creator.module';

describe('TreeNodeDispenserComponent', () => {
  let component: TreeNodeDispenserComponent;
  let fixture: ComponentFixture<TreeNodeDispenserComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TreeNodeDispenserComponent],
        imports: [TemplateCreatorModule]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNodeDispenserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
