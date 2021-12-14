import { TriggerFactory } from 'src/app/modules/template-creator/classes/triggers/trigger-factory';
import { DependencyGraph } from 'src/app/modules/template-creator/classes/dependency-graph/dependency-graph';
import { TemplateTimeline } from 'src/app/modules/template-creator/classes/timeline/template-timeline';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { TriggerType } from 'src/app/modules/template-creator/models/enums/trigger-type';
import { StageNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/stage-node';
import { StepNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/step-node';
import { StepEdge } from 'src/app/modules/template-creator/classes/dependency-graph/edge/step-edge';

/**
 * Main template dependency graph.
 */
export const basicTemplateDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);

/**
 * Expected description of main template dependency graph.
 */
export const basicTemplateDescription = `plan:
  name: Basic template
  owner: Test runner
  stages:
    - name: stage-one
      trigger_type: delta
      trigger_args:
        hours: 1
        minutes: 20
        seconds: 20
      steps:
        - name: scan-localhost
          attack_module: mod_nmap
          attack_module_args:
            target: 127.0.0.1
            ports:
              - 22
          is_init: true
          next:
            - step: bruteforce
              type: result
              value: OK
        - name: bruteforce
          attack_module: mod_medusa
          attack_module_args:
            target: 127.0.0.1
            credentials:
              username: vagrant
`;

// Create parents
const basicTimeline = new TemplateTimeline();
const basicStageChildDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);

// Create stage
const basicDeltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 1, minutes: 20, seconds: 20 });
const basicStage = new StageNode({
  name: 'stage-one',
  childDepGraph: basicStageChildDepGraph,
  timeline: basicTimeline,
  trigger: basicDeltaTrigger
});

// Create steps
const firstStep = new StepNode('scan-localhost', 'mod_nmap', 'target: 127.0.0.1\nports:\n  - 22');
const secondStep = new StepNode('bruteforce', 'mod_medusa', 'target: 127.0.0.1\ncredentials:\n  username: vagrant');
basicStageChildDepGraph.graphNodeManager.addNode(firstStep);
basicStageChildDepGraph.graphNodeManager.addNode(secondStep);

// Create edge between steps with a condition
const stepEdge = basicStageChildDepGraph.createDraggedEdge(firstStep) as StepEdge;
basicStageChildDepGraph.connectDraggedEdge(secondStep);
stepEdge.conditions.push({ type: 'result', value: 'OK' });

// Add stage to dependency graph
basicTemplateDepGraph.graphNodeManager.addNode(basicStage);
