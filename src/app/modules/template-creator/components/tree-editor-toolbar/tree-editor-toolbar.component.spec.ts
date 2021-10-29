import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeEditorToolbarComponent } from './tree-editor-toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { NodeType } from '../../models/enums/node-type';
import { ChangeDetectionStrategy } from '@angular/core';

describe('TreeEditorToolbarComponent', () => {
  let component: TreeEditorToolbarComponent;
  let fixture: ComponentFixture<TreeEditorToolbarComponent>;

  const testingDepTree = new DependencyTree(NodeType.CRYTON_STEP);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule],
      declarations: [TreeEditorToolbarComponent]
    })
      .overrideComponent(TreeEditorToolbarComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeEditorToolbarComponent);

    component = fixture.componentInstance;
    component.depTree = testingDepTree;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
