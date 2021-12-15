import { TriggerFactory } from 'src/app/modules/template-creator/classes/triggers/trigger-factory';
import { DependencyGraph } from 'src/app/modules/template-creator/classes/dependency-graph/dependency-graph';
import { TemplateTimeline } from 'src/app/modules/template-creator/classes/timeline/template-timeline';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { TriggerType } from 'src/app/modules/template-creator/models/enums/trigger-type';
import { StageNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/stage-node';
import { StepNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/step-node';

/**
 * Main template dependency graph.
 */
export const httpTemplateDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);

/**
 * Expected description of main template dependency graph.
 */
export const httpTemplateDescription = `plan:
  name: HTTP trigger plan
  owner: Test runner
  stages:
    - name: stage-one
      trigger_type: delta
      trigger_args:
        hours: 0
        minutes: 0
        seconds: 5
      steps:
        - name: get-request
          step_type: cryton/execute-on-worker
          arguments:
            attack_module: mod_cmd
            attack_module_args:
              cmd: curl http://localhost:8082/index?a=1
          is_init: true
    - name: stage-two
      trigger_type: HTTPListener
      trigger_args:
        host: localhost
        port: 8082
        routes:
          - path: /index
            method: GET
            parameters:
              - name: a
                value: "1"
      steps:
        - name: scan-localhost
          step_type: cryton/execute-on-worker
          arguments:
            attack_module: mod_nmap
            attack_module_args:
              target: 127.0.0.1
          is_init: true
      depends_on:
        - stage-one
`;

// Create parents
const timeline = new TemplateTimeline();
const deltaStageChildDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);
const httpStageChildDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);

// Create delta stage
const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 5 });
const deltaStage = new StageNode({
  name: 'stage-one',
  childDepGraph: deltaStageChildDepGraph,
  timeline,
  trigger: deltaTrigger
});
const deltaStageStep = new StepNode('get-request', 'mod_cmd', `cmd: curl http://localhost:8082/index?a=1`);
deltaStageChildDepGraph.graphNodeManager.addNode(deltaStageStep);
httpTemplateDepGraph.graphNodeManager.addNode(deltaStage);

// Create HTTP listener stage
const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, {
  host: 'localhost',
  port: 8082,
  routes: [{ path: '/index', method: 'GET', parameters: [{ name: 'a', value: '1' }] }]
});
const httpStage = new StageNode({
  name: 'stage-two',
  childDepGraph: httpStageChildDepGraph,
  timeline,
  trigger: httpTrigger
});
const httpStageStep = new StepNode('scan-localhost', 'mod_nmap', 'target: 127.0.0.1');
httpStageChildDepGraph.graphNodeManager.addNode(httpStageStep);
httpTemplateDepGraph.graphNodeManager.addNode(httpStage);

httpTemplateDepGraph.createDraggedEdge(deltaStage);
httpTemplateDepGraph.connectDraggedEdge(httpStage);
