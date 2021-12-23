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
export const advancedTemplateDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);

/**
 * Expected description of main template dependency graph.
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
          step_type: cryton/execute-on-worker
          arguments:
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
          step_type: cryton/execute-on-worker
          arguments:
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
          step_type: cryton/execute-on-worker
          arguments:
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
          step_type: cryton/execute-on-worker
          arguments:
            attack_module: mod_cmd
            attack_module_args:
              use_named_session: session_to_target_1
              cmd: "{{ commands.passwd }}"
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
const deltaStageStepOne = new StepNode('scan-localhost', 'mod_nmap', `target: "{{ target }}"\nports:\n  - 22`);
const deltaStageStepTwo = new StepNode(
  'bruteforce',
  'mod_medusa',
  `target: "{{ target }}"\ncredentials:\n  username: "{{ username }}"`
);
deltaStageChildDepGraph.graphNodeManager.addNode(deltaStageStepOne);
deltaStageChildDepGraph.graphNodeManager.addNode(deltaStageStepTwo);

const edgeOne = deltaStageChildDepGraph.createDraggedEdge(deltaStageStepOne);
deltaStageChildDepGraph.connectDraggedEdge(deltaStageStepTwo);
(edgeOne as StepEdge).conditions.push({ type: 'result', value: 'OK' });

advancedTemplateDepGraph.graphNodeManager.addNode(deltaStage);

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
const httpStageStepOne = new StepNode(
  'ssh-session',
  'mod_msf',
  // eslint-disable-next-line max-len
  `create_named_session: session_to_target_1\nexploit: auxiliary/scanner/ssh/ssh_login\nexploit_arguments:\n  RHOSTS: "{{ target }}"\n  USERNAME: $bruteforce.username\n  PASSWORD: $bruteforce.password`
);
const httpStageStepTwo = new StepNode(
  'session-cmd',
  'mod_cmd',
  `use_named_session: session_to_target_1\ncmd: "{{ commands.passwd }}"`
);
httpStageChildDepGraph.graphNodeManager.addNode(httpStageStepOne);
httpStageChildDepGraph.graphNodeManager.addNode(httpStageStepTwo);
advancedTemplateDepGraph.graphNodeManager.addNode(httpStage);

const edgeTwo = httpStageChildDepGraph.createDraggedEdge(httpStageStepOne);
httpStageChildDepGraph.connectDraggedEdge(httpStageStepTwo);
(edgeTwo as StepEdge).conditions.push({ type: 'result', value: 'OK' });

advancedTemplateDepGraph.createDraggedEdge(deltaStage);
advancedTemplateDepGraph.connectDraggedEdge(httpStage);
