import { GraphNode } from './graph-node';

export class StepNode extends GraphNode {
  attackModule: string;
  attackModuleArgs: string;

  constructor(name: string, attackModule: string, attackModuleArgs: string) {
    super(name);
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
    if (this.konvaObject && this.konvaObject.getStage()) {
      this.draw();
    }
  }
}
