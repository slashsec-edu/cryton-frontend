import { NodeType } from '../../models/enums/node-type';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { CrytonNode } from './cryton-node';
import { TreeNode } from '../dependency-tree/tree-node';

export class CrytonStep extends CrytonNode {
  // Cryton step data
  attackModule: string;
  attackModuleArgs: string;

  constructor(name: string, attackModule: string, attackModuleArgs: string, depTree: DependencyTree) {
    super(name, depTree);
    this.attackModule = attackModule;
    this.attackModuleArgs = attackModuleArgs;
    this.parentDepTree = depTree;
    this.treeNode = new TreeNode(this, NodeType.CRYTON_STEP);
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

    this.treeNode.changeName(name);
  }
}
