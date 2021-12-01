import { Tabs, TabsRouter } from '../../utils/tabs-router';
import { DependencyTree } from '../dependency-tree';
import { TreeNode } from './tree-node';

export class StepNode extends TreeNode {
  attackModule: string;
  attackModuleArgs: string;

  constructor(name: string, attackModule: string, attackModuleArgs: string, parentDepTree: DependencyTree) {
    super(parentDepTree, name);
    this.attackModule = attackModule;
    this.attackModuleArgs = attackModuleArgs;
  }

  /**
   * Edits step parameters.
   *
   * @param name Name of the step.
   * @param attackModule Attack module.
   * @param attackModuleArgs Attack module arguments.
   */
  edit(name: string, attackModule: string, attackModuleArgs: string): void {
    this.name = name;
    this.attackModule = attackModule;
    this.attackModuleArgs = attackModuleArgs;

    this.changeName(name);

    // Only draw if the node is attached to stage
    if (this.konvaObject.getStage()) {
      this.draw();
    }
  }

  protected _onSettingsClick(): void {
    super._onSettingsClick();
    TabsRouter.selectIndex(Tabs.CREATE_STEP);
  }
}
