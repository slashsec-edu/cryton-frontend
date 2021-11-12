import { CrytonStepEdge } from 'src/app/modules/template-creator/classes/cryton-edge/cryton-step-edge';
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
const basicStage = new CrytonStage({
  name: 'stage-one',
  childDepTree: basicStageChildDepTree,
  parentDepTree: basicTemplateDepTree,
  timeline: basicTimeline,
  trigger: basicDeltaTrigger
});

// Create steps
const firsStep = new CrytonStep(
  'scan-localhost',
  'mod_nmap',
  'target: 127.0.0.1\nports:\n  - 22',
  basicStageChildDepTree
);
const secondStep = new CrytonStep(
  'bruteforce',
  'mod_medusa',
  'target: 127.0.0.1\ncredentials:\n  username: vagrant',
  basicStageChildDepTree
);
basicStageChildDepTree.treeNodeManager.moveToPlan(firsStep);
basicStageChildDepTree.treeNodeManager.moveToPlan(secondStep);

// Create edge between steps with a condition
const stepEdge = basicStageChildDepTree.createDraggedEdge(firsStep) as CrytonStepEdge;
basicStageChildDepTree.connectDraggedEdge(secondStep);
stepEdge.conditions.push({ type: 'result', value: 'OK' });

// Add stage to dependency tree
basicTemplateDepTree.treeNodeManager.moveToPlan(basicStage);
