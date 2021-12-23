import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphEditorToolbarComponent } from './graph-editor-toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { ChangeDetectionStrategy } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { Spied } from 'src/app/testing/utility/utility-types';
import { ToolsService } from '../../services/tools.service';
import { MatIconHarness } from '@angular/material/icon/testing';

class ToolStateStub {
  isMoveNodeEnabled = false;
  isSwapEnabled = false;
  isDeleteEnabled = false;

  enableTools(): void {
    this.isMoveNodeEnabled = true;
    this.isSwapEnabled = true;
    this.isDeleteEnabled = true;
  }

  disableTools(): void {
    this.isMoveNodeEnabled = false;
    this.isSwapEnabled = false;
    this.isDeleteEnabled = false;
  }
}

enum ToolIcon {
  ZOOM_IN = 'zoom_in',
  ZOOM_OUT = 'zoom_out',
  FIT_SCREEN = 'fullscreen',
  MOVE = 'back_hand',
  SWAP = 'swap_horizontal',
  DELETE = 'delete_forever'
}

const ACTIVE_CLASS_NAME = 'dependency-graph--active';

describe('GraphEditorToolbarComponent', () => {
  let component: GraphEditorToolbarComponent;
  let fixture: ComponentFixture<GraphEditorToolbarComponent>;
  let loader: HarnessLoader;

  const toolStateStub = new ToolStateStub();
  const depGraphStub = jasmine.createSpyObj('DependencyGraph', [], { toolState: toolStateStub }) as DependencyGraph;

  const toolServiceStub = jasmine.createSpyObj('ToolsService', [
    'rescale',
    'fitInsideScreen',
    'enableNodeMove',
    'enableSwap',
    'enableDelete'
  ]) as Spied<ToolsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatIconModule],
      declarations: [GraphEditorToolbarComponent],
      providers: [{ provide: ToolsService, useValue: toolServiceStub }]
    })
      .overrideComponent(GraphEditorToolbarComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphEditorToolbarComponent);

    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.depGraph = depGraphStub;
    toolStateStub.disableTools();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all of the defined tools', async () => {
    for (const tool of component.tools) {
      const button = await loader.getHarness(MatButtonHarness.with({ text: tool.icon }));
      expect(button).toBeTruthy();
    }
  });

  it('should call correct methods on click', async () => {
    const tools = await loader.getAllHarnesses(MatButtonHarness);

    for (const tool of tools) {
      const icon = await tool.getText();
      await tool.click();

      switch (icon) {
        case ToolIcon.ZOOM_IN:
          expect(toolServiceStub.rescale).toHaveBeenCalled();
          break;
        case ToolIcon.ZOOM_OUT:
          expect(toolServiceStub.rescale).toHaveBeenCalled();
          break;
        case ToolIcon.FIT_SCREEN:
          expect(toolServiceStub.fitInsideScreen).toHaveBeenCalled();
          break;
        case ToolIcon.MOVE:
          expect(toolServiceStub.enableNodeMove).toHaveBeenCalled();
          break;
        case ToolIcon.SWAP:
          expect(toolServiceStub.enableSwap).toHaveBeenCalled();
          break;
        case ToolIcon.DELETE:
          expect(toolServiceStub.enableDelete).toHaveBeenCalled();
          break;
        default:
          break;
      }
    }
  });

  it('should activate tools based on tool state', async () => {
    toolStateStub.enableTools();

    const activatableTools = [ToolIcon.DELETE, ToolIcon.SWAP, ToolIcon.MOVE];

    for (const toolIconName of activatableTools) {
      const tool = await loader.getHarness(MatButtonHarness.with({ text: toolIconName }));
      const toolIcon = await tool.getHarness(MatIconHarness);
      const isActive = await toolIcon.host().then(icon => icon.hasClass(ACTIVE_CLASS_NAME));
      expect(isActive).toBeTrue();
    }
  });
});
