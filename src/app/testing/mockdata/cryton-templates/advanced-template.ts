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
export const advancedTemplateDepTree = new DependencyTree(NodeType.CRYTON_STAGE);

/**
 * Expected description of main template dependency tree.
 */
export const advancedTemplateDescription = `plan:
  name: Advanced example
  owner: Test runner
  stages:
    - name: stage-one
      trigger_type: delta
      trigger_args:
        hours: 0
        minutes: 0
        seconds: 5
      steps:
        - name: scan-localhost
          attack_module: mod_nmap
          attack_module_args:
            target: "{{ target }}"
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
            target: "{{ target }}"
            credentials:
              username: "{{ username }}"
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
        - name: ssh-session
          attack_module: mod_msf
          attack_module_args:
            create_named_session: session_to_target_1
            exploit: auxiliary/scanner/ssh/ssh_login
            exploit_arguments:
              RHOSTS: "{{ target }}"
              USERNAME: $bruteforce.username
              PASSWORD: $bruteforce.password
          is_init: true
          next:
            - step: session-cmd
              type: result
              value: OK
        - name: session-cmd
          attack_module: mod_cmd
          attack_module_args:
            use_named_session: session_to_target_1
            cmd: "{{ commands.passwd }}"
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
  parentDepTree: advancedTemplateDepTree,
  timeline,
  trigger: deltaTrigger
});
const deltaStageStepOne = new CrytonStep(
  'scan-localhost',
  'mod_nmap',
  `target: "{{ target }}"\nports:\n  - 22`,
  deltaStageChildDepTree
);
const deltaStageStepTwo = new CrytonStep(
  'bruteforce',
  'mod_medusa',
  `target: "{{ target }}"\ncredentials:\n  username: "{{ username }}"`,
  deltaStageChildDepTree
);
deltaStageChildDepTree.treeNodeManager.moveToPlan(deltaStageStepOne);
deltaStageChildDepTree.treeNodeManager.moveToPlan(deltaStageStepTwo);

const edgeOne = deltaStageChildDepTree.createDraggedEdge(deltaStageStepOne);
deltaStageChildDepTree.connectDraggedEdge(deltaStageStepTwo);
(edgeOne as CrytonStepEdge).conditions.push({ type: 'result', value: 'OK' });

advancedTemplateDepTree.treeNodeManager.moveToPlan(deltaStage);

// Create HTTP listener stage
const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, {
  host: 'localhost',
  port: 8082,
  routes: [{ path: '/index', method: 'GET', parameters: [{ name: 'a', value: '1' }] }]
});
const httpStage = new CrytonStage({
  name: 'stage-two',
  childDepTree: httpStageChildDepTree,
  parentDepTree: advancedTemplateDepTree,
  timeline,
  trigger: httpTrigger
});
const httpStageStepOne = new CrytonStep(
  'ssh-session',
  'mod_msf',
  // eslint-disable-next-line max-len
  `create_named_session: session_to_target_1\nexploit: auxiliary/scanner/ssh/ssh_login\nexploit_arguments:\n  RHOSTS: "{{ target }}"\n  USERNAME: $bruteforce.username\n  PASSWORD: $bruteforce.password`,
  httpStageChildDepTree
);
const httpStageStepTwo = new CrytonStep(
  'session-cmd',
  'mod_cmd',
  `use_named_session: session_to_target_1\ncmd: "{{ commands.passwd }}"`,
  httpStageChildDepTree
);
httpStageChildDepTree.treeNodeManager.moveToPlan(httpStageStepOne);
httpStageChildDepTree.treeNodeManager.moveToPlan(httpStageStepTwo);
advancedTemplateDepTree.treeNodeManager.moveToPlan(httpStage);

const edgeTwo = httpStageChildDepTree.createDraggedEdge(httpStageStepOne);
httpStageChildDepTree.connectDraggedEdge(httpStageStepTwo);
(edgeTwo as CrytonStepEdge).conditions.push({ type: 'result', value: 'OK' });

advancedTemplateDepTree.createDraggedEdge(deltaStage);
advancedTemplateDepTree.connectDraggedEdge(httpStage);
