import { CrytonStage } from 'src/app/modules/template-creator/classes/cryton-node/cryton-stage';
import { CrytonStep } from 'src/app/modules/template-creator/classes/cryton-node/cryton-step';
import { TriggerFactory } from 'src/app/modules/template-creator/classes/cryton-node/triggers/trigger-factory';
import { DependencyTree } from 'src/app/modules/template-creator/classes/dependency-tree/dependency-tree';
import { TemplateTimeline } from 'src/app/modules/template-creator/classes/timeline/template-timeline';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { TriggerType } from 'src/app/modules/template-creator/models/enums/trigger-type';

/**
 * Main template dependency tree.
 */
export const httpTemplateDepTree = new DependencyTree(NodeType.CRYTON_STAGE);

/**
 * Expected description of main template dependency tree.
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
          attack_module: mod_nmap
          attack_module_args:
            target: 127.0.0.1
          is_init: true
      depends_on:
        - stage-one
`;

// Create parents
const timeline = new TemplateTimeline();
const deltaStageChildDepTree = new DependencyTree(NodeType.CRYTON_STEP);
const httpStageChildDepTree = new DependencyTree(NodeType.CRYTON_STEP);

// Create delta stage
const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 5 });
const deltaStage = new CrytonStage({
  name: 'stage-one',
  childDepTree: deltaStageChildDepTree,
  parentDepTree: httpTemplateDepTree,
  timeline,
  trigger: deltaTrigger
});
const deltaStageStep = new CrytonStep(
  'get-request',
  'mod_cmd',
  `cmd: curl http://localhost:8082/index?a=1`,
  deltaStageChildDepTree
);
deltaStageChildDepTree.treeNodeManager.moveToPlan(deltaStageStep);
httpTemplateDepTree.treeNodeManager.moveToPlan(deltaStage);

// Create HTTP listener stage
const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, {
  host: 'localhost',
  port: 8082,
  routes: [{ path: '/index', method: 'GET', parameters: [{ name: 'a', value: '1' }] }]
});
const httpStage = new CrytonStage({
  name: 'stage-two',
  childDepTree: httpStageChildDepTree,
  parentDepTree: httpTemplateDepTree,
  timeline,
  trigger: httpTrigger
});
const httpStageStep = new CrytonStep('scan-localhost', 'mod_nmap', 'target: 127.0.0.1', httpStageChildDepTree);
httpStageChildDepTree.treeNodeManager.moveToPlan(httpStageStep);
httpTemplateDepTree.treeNodeManager.moveToPlan(httpStage);

httpTemplateDepTree.createDraggedEdge(deltaStage);
httpTemplateDepTree.connectDraggedEdge(httpStage);
