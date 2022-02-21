import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, first, mapTo, tap } from 'rxjs/operators';
import { TemplateDetail } from 'src/app/models/api-responses/template-detail.interface';
import { TemplateService } from 'src/app/services/template.service';
import { parse, stringify } from 'yaml';
import { DependencyGraph } from '../classes/dependency-graph/dependency-graph';
import { StepEdge } from '../classes/dependency-graph/edge/step-edge';
import { StageNode } from '../classes/dependency-graph/node/stage-node';
import { StepNode } from '../classes/dependency-graph/node/step-node';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { TriggerFactory } from '../classes/triggers/trigger-factory';
import { NodeOrganizer, OrganizerNodeType } from '../classes/utils/node-organizer';
import { NodeType } from '../models/enums/node-type';
import {
  StageDescription,
  StepDescription,
  StepEdgeDescription,
  TemplateDescription
} from '../models/interfaces/template-description';
import { DependencyGraphManagerService, DepGraphRef } from './dependency-graph-manager.service';
import { TemplateCreatorStateService } from './template-creator-state.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateConverterService {
  constructor(
    private _state: TemplateCreatorStateService,
    private _graphManager: DependencyGraphManagerService,
    private _templateService: TemplateService
  ) {}

  editTemplate(templateID: number): Observable<boolean> {
    return this._templateService.fetchYaml(templateID).pipe(
      first(),
      tap((template: Record<string, unknown>) =>
        this.importTemplate((template as unknown as TemplateDetail).detail.template)
      ),
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
    this.importTemplate(parse(yaml) as TemplateDescription);
  }

  /**
   * Imports template into the template creator.
   *
   * @param template Template description as JSON object.
   */
  importTemplate(template: TemplateDescription): void {
    this._resetTemplateCreator();
    const parentDepGraph = this._graphManager.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value;
    const stageOrganizer = new NodeOrganizer(OrganizerNodeType.STAGE);

    this._state.templateForm.setValue({
      name: template.plan.name,
      owner: template.plan.owner
    });

    const stagesWithParents: Record<string, { stage: StageNode; parents: string[] }> = {};

    template.plan.stages.forEach(stageDescription => {
      const stage = this._createStage(stageDescription, parentDepGraph);
      stage.parentDepGraph.graphNodeManager.addNode(stage);
      stagesWithParents[stageDescription.name] = {
        stage,
        parents: stageDescription.depends_on
      };
    });

    this._createStageEdges(stagesWithParents);
    stageOrganizer.organizeNodes(Object.values(stagesWithParents).map(stageWithParent => stageWithParent.stage));

    parentDepGraph.updateAllEdges();
    parentDepGraph.graphLayer.draw();
  }

  /**
   * Exports template from the template creator to the YAML description.
   *
   * @returns YAML description of the template.
   */
  exportYAMLTemplate(): string {
    const templateDepGraph = this._graphManager.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value;
    const name = this._state.templateForm.get('name').value as string;
    const owner = this._state.templateForm.get('owner').value as string;

    const template: TemplateDescription = { plan: { name, owner, stages: [] } };

    templateDepGraph.graphNodeManager.nodes.forEach((node: StageNode) => {
      const stage: StageDescription = {
        name: node.name,
        trigger_type: node.trigger.getType(),
        trigger_args: node.trigger.getArgs(),
        steps: this._createStepsYaml(node.childDepGraph.graphNodeManager.nodes as StepNode[])
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
    this._graphManager.resetCurrentGraph(DepGraphRef.TEMPLATE_CREATION);
    this._graphManager.resetCurrentGraph(DepGraphRef.STAGE_CREATION);
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
        step_type: 'cryton/execute-on-worker',
        arguments: {
          attack_module: step.attackModule,
          attack_module_args: parse(step.attackModuleArgs) as Record<string, string>
        }
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
   * @param parentDepGraph Stage's parent dependency graph.
   * @returns Cryton stage.
   */
  private _createStage(stageDescription: StageDescription, parentDepGraph: DependencyGraph): StageNode {
    const childDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);
    const parentTimeline = this._state.timeline;
    const stepOrganizer = new NodeOrganizer(OrganizerNodeType.STEP);

    const stepsWithEdges: Record<string, { step: StepNode; next: StepEdgeDescription[] }> = {};

    stageDescription.steps.forEach(stepDescription => {
      const step = this._createStep(stepDescription, childDepGraph);
      childDepGraph.graphNodeManager.addNode(step);
      stepsWithEdges[stepDescription.name] = { step, next: stepDescription.next };
    });
    this._createStepEdges(stepsWithEdges);
    const rootNode = Object.values(stepsWithEdges).find(step => step.step.parentEdges.length === 0);
    stepOrganizer.organizeGraph(rootNode.step);

    childDepGraph.updateAllEdges();
    childDepGraph.graphLayer.draw();

    const trigger = TriggerFactory.createTrigger(stageDescription.trigger_type, stageDescription.trigger_args);

    const crytonStage = new StageNode({
      name: stageDescription.name,
      childDepGraph,
      timeline: parentTimeline,
      trigger
    });
    crytonStage.setParentDepGraph(parentDepGraph);

    return crytonStage;
  }

  /**
   * Creates step from the YAML representation.
   *
   * @param stepDescription YAML description of the step.
   * @param parentDepGraph Step's parent dependency graph.
   * @returns Cryton step.
   */
  private _createStep(stepDescription: StepDescription, parentDepGraph: DependencyGraph): StepNode {
    const step = new StepNode(
      stepDescription.name,
      stepDescription.arguments.attack_module,
      stringify(stepDescription.arguments.attack_module_args)
    );
    step.setParentDepGraph(parentDepGraph);

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
    const edge = parentNode.parentDepGraph.createDraggedEdge(parentNode) as StepEdge;
    parentNode.parentDepGraph.connectDraggedEdge(childNode);
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
        stageWithParent.stage.parentDepGraph.createDraggedEdge(stages[parent].stage);
        stageWithParent.stage.parentDepGraph.connectDraggedEdge(stageWithParent.stage);
      });
    });
  }
}
