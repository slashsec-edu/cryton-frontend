import { Injectable } from '@angular/core';
import { parse, stringify } from 'yaml';
import { DependencyTree } from '../classes/dependency-tree/dependency-tree';
import { NodeType } from '../models/enums/node-type';
import {
  TemplateDescription,
  StageDescription,
  StepDescription,
  StepEdgeDescription
} from '../models/interfaces/template-description';
import { DependencyTreeManagerService, DepTreeRef } from './dependency-tree-manager.service';
import { TemplateCreatorStateService } from './template-creator-state.service';
import { NodeOrganizer, NodeType as OrganizerNodeType } from '../classes/utils/node-organizer';
import { Observable, of } from 'rxjs';
import { first, tap, mapTo, catchError } from 'rxjs/operators';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { TemplateService } from 'src/app/services/template.service';
import { TemplateDetail } from 'src/app/models/api-responses/template-detail.interface';
import { TriggerFactory } from '../classes/triggers/trigger-factory';
import { StageNode } from '../classes/dependency-tree/node/stage-node';
import { StepNode } from '../classes/dependency-tree/node/step-node';
import { StepEdge } from '../classes/dependency-tree/edge/step-edge';

@Injectable({
  providedIn: 'root'
})
export class TemplateConverterService {
  constructor(
    private _state: TemplateCreatorStateService,
    private _treeManager: DependencyTreeManagerService,
    private _templateService: TemplateService
  ) {}

  editTemplate(templateID: number): Observable<boolean> {
    return this._templateService.getTemplateDetail(templateID).pipe(
      first(),
      tap((template: TemplateDetail) => this.importTemplate(template.detail.template)),
      catchError(() => of(false)),
      mapTo(true)
    ) as Observable<boolean>;
  }

  /**
   * Imports template from YAML description into the template creator.
   *
   * @param yaml YAML description of the template.
   */
  importYAMLTemplate(yaml: string): void {
    this.importTemplate(parse(yaml));
  }

  /**
   * Imports template into the template creator.
   *
   * @param template Template description as JSON object.
   */
  importTemplate(template: TemplateDescription): void {
    this._resetTemplateCreator();
    const parentDepTree = this._treeManager.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value;
    const stageOrganizer = new NodeOrganizer(OrganizerNodeType.STAGE);

    this._state.templateForm.setValue({
      name: template.plan.name,
      owner: template.plan.owner
    });

    const stagesWithParents: Record<string, { stage: StageNode; parents: string[] }> = {};

    template.plan.stages.forEach(stageDescription => {
      const stage = this._createStage(stageDescription, parentDepTree);
      stage.parentDepTree.treeNodeManager.addNode(stage);
      stagesWithParents[stageDescription.name] = {
        stage,
        parents: stageDescription.depends_on
      };
    });

    this._createStageEdges(stagesWithParents);
    stageOrganizer.organizeNodes(Object.values(stagesWithParents).map(stageWithParent => stageWithParent.stage));

    parentDepTree.updateAllEdges();
    parentDepTree.treeLayer.draw();
  }

  /**
   * Exports template from the template creator to the YAML description.
   *
   * @returns YAML description of the template.
   */
  exportYAMLTemplate(): string {
    const templateDepTree = this._treeManager.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value;
    const name = this._state.templateForm.get('name').value as string;
    const owner = this._state.templateForm.get('owner').value as string;

    const template: TemplateDescription = { plan: { name, owner, stages: [] } };

    templateDepTree.treeNodeManager.nodes.forEach((node: StageNode) => {
      const stage: StageDescription = {
        name: node.name,
        trigger_type: node.trigger.getType(),
        trigger_args: node.trigger.getArgs(),
        steps: this._createStepsYaml(node.childDepTree.treeNodeManager.nodes as StepNode[])
      };

      if (node.parentEdges.length > 0) {
        stage.depends_on = [];
        node.parentEdges.forEach(edge => {
          stage.depends_on.push(edge.parentNode.name);
        });
      }

      template.plan.stages.push(stage);
    });

    return stringify(template);
  }

  private _resetTemplateCreator(): void {
    this._state.timeline = new TemplateTimeline();
    this._treeManager.resetCurrentTree(DepTreeRef.TEMPLATE_CREATION);
    this._treeManager.resetCurrentTree(DepTreeRef.STAGE_CREATION);
  }

  /**
   * Creates object from the steps which can be easily stringified into YAML representation.
   *
   * @param steps Cryton steps.
   * @returns Steps yaml object.
   */
  private _createStepsYaml(steps: StepNode[]): StepDescription[] {
    const stepArray: StepDescription[] = [];

    steps.forEach(step => {
      const stepDescription: StepDescription = {
        name: step.name,
        attack_module: step.attackModule,
        attack_module_args: parse(step.attackModuleArgs) as Record<string, any>
      };
      const next: StepEdgeDescription[] = [];

      step.childEdges.forEach((edge: StepEdge) => {
        edge.conditions.forEach(condition => {
          next.push({ step: edge.childNode.name, ...condition });
        });
      });

      if (step.parentEdges.length === 0) {
        stepDescription.is_init = true;
      }
      if (next.length > 0) {
        stepDescription.next = next;
      }

      stepArray.push(stepDescription);
    });

    return stepArray;
  }

  /**
   * Creates cryton stage from the YAML description.
   *
   * @param stageDescription YAML description of the stage.
   * @param parentDepTree Stage's parent dependency tree.
   * @returns Cryton stage.
   */
  private _createStage(stageDescription: StageDescription, parentDepTree: DependencyTree): StageNode {
    const childDepTree = new DependencyTree(NodeType.CRYTON_STEP);
    const parentTimeline = this._state.timeline;
    const stepOrganizer = new NodeOrganizer(OrganizerNodeType.STEP);

    const stepsWithEdges: Record<string, { step: StepNode; next: StepEdgeDescription[] }> = {};

    stageDescription.steps.forEach(stepDescription => {
      const step = this._createStep(stepDescription, childDepTree);
      childDepTree.treeNodeManager.addNode(step);
      stepsWithEdges[stepDescription.name] = { step, next: stepDescription.next };
    });
    this._createStepEdges(stepsWithEdges);
    const rootNode = Object.values(stepsWithEdges).find(step => step.step.parentEdges.length === 0);
    stepOrganizer.organizeTree(rootNode.step);

    childDepTree.updateAllEdges();
    childDepTree.treeLayer.draw();

    const trigger = TriggerFactory.createTrigger(stageDescription.trigger_type, stageDescription.trigger_args);

    const crytonStage = new StageNode({
      name: stageDescription.name,
      parentDepTree,
      childDepTree,
      timeline: parentTimeline,
      trigger
    });

    return crytonStage;
  }

  /**
   * Creates step from the YAML representation.
   *
   * @param stepDescription YAML description of the step.
   * @param parentDepTree Step's parent dependency tree.
   * @returns Cryton step.
   */
  private _createStep(stepDescription: StepDescription, parentDepTree: DependencyTree): StepNode {
    const step = new StepNode(
      stepDescription.name,
      stepDescription.attack_module,
      stringify(stepDescription.attack_module_args),
      parentDepTree
    );

    return step;
  }

  /**
   * Creates all edges between steps.
   *
   * @param steps Record with step name as a key and an object with
   * cryton step and YAML representations of all of its edges as the value.
   */
  private _createStepEdges(steps: Record<string, { step: StepNode; next: StepEdgeDescription[] }>): void {
    Object.values(steps).forEach(stepWithEdges => {
      // <Parent step name, step's edges>
      const createdEdges: Record<string, StepEdge[]> = {};

      stepWithEdges.next?.forEach(edgeYaml => {
        let matchingEdge: StepEdge;

        if (!createdEdges[stepWithEdges.step.name]) {
          matchingEdge = this._createStepEdge(stepWithEdges.step, steps[edgeYaml.step].step);
          createdEdges[stepWithEdges.step.name] = [matchingEdge];
        } else {
          const edgeToChild = createdEdges[stepWithEdges.step.name].find(
            edge => edge.childNode.name === steps[edgeYaml.step].step.name
          );

          if (edgeToChild) {
            matchingEdge = edgeToChild;
          } else {
            matchingEdge = this._createStepEdge(stepWithEdges.step, steps[edgeYaml.step].step);
            createdEdges[stepWithEdges.step.name].push(matchingEdge);
          }
        }
        matchingEdge.conditions.push({ type: edgeYaml.type, value: edgeYaml.value });
      });
    });
  }

  /**
   * Creates a single edge between two nodes.
   *
   * @param parentNode Parent node.
   * @param childNode Child node.
   * @returns Cryton step edge.
   */
  private _createStepEdge(parentNode: StepNode, childNode: StepNode): StepEdge {
    const edge = parentNode.parentDepTree.createDraggedEdge(parentNode) as StepEdge;
    parentNode.parentDepTree.connectDraggedEdge(childNode);
    return edge;
  }

  /**
   * Creates all edges between stages.
   *
   * @param stages Record with stage name as a key and an object with cryton stage and names of all of its parents as the value.
   */
  private _createStageEdges(stages: Record<string, { stage: StageNode; parents: string[] }>) {
    Object.values(stages).forEach(stageWithParent => {
      stageWithParent.parents?.forEach(parent => {
        stageWithParent.stage.parentDepTree.createDraggedEdge(stages[parent].stage);
        stageWithParent.stage.parentDepTree.connectDraggedEdge(stageWithParent.stage);
      });
    });
  }
}
