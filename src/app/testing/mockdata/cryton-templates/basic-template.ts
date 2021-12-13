import { TriggerFactory } from 'src/app/modules/template-creator/classes/triggers/trigger-factory';
import { DependencyTree } from 'src/app/modules/template-creator/classes/dependency-tree/dependency-tree';
import { TemplateTimeline } from 'src/app/modules/template-creator/classes/timeline/template-timeline';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { TriggerType } from 'src/app/modules/template-creator/models/enums/trigger-type';
import { StageNode } from 'src/app/modules/template-creator/classes/dependency-tree/node/stage-node';
import { StepNode } from 'src/app/modules/template-creator/classes/dependency-tree/node/step-node';
import { StepEdge } from 'src/app/modules/template-creator/classes/dependency-tree/edge/step-edge';

/**
 * Main template dependency tree.
 */
export const basicTemplateDepTree = new DependencyTree(NodeType.CRYTON_STAGE);

/**
 * Expected description of main template dependency tree.
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
const basicStageChildDepTree = new DependencyTree(NodeType.CRYTON_STEP);

// Create stage
const basicDeltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 1, minutes: 20, seconds: 20 });
const basicStage = new StageNode({
  name: 'stage-one',
  childDepTree: basicStageChildDepTree,
  parentDepTree: basicTemplateDepTree,
  timeline: basicTimeline,
  trigger: basicDeltaTrigger
});

// Create steps
const firstStep = new StepNode(
  'scan-localhost',
  'mod_nmap',
  'target: 127.0.0.1\nports:\n  - 22',
  basicStageChildDepTree
);
const secondStep = new StepNode(
  'bruteforce',
  'mod_medusa',
  'target: 127.0.0.1\ncredentials:\n  username: vagrant',
  basicStageChildDepTree
);
basicStageChildDepTree.treeNodeManager.addNode(firstStep);
basicStageChildDepTree.treeNodeManager.addNode(secondStep);

// Create edge between steps with a condition
const stepEdge = basicStageChildDepTree.createDraggedEdge(firstStep) as StepEdge;
basicStageChildDepTree.connectDraggedEdge(secondStep);
stepEdge.conditions.push({ type: 'result', value: 'OK' });

// Add stage to dependency tree
basicTemplateDepTree.treeNodeManager.addNode(basicStage);
