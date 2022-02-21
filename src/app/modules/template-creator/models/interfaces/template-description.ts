import { TriggerArgs } from '../../classes/triggers/trigger';
import { TriggerType } from '../enums/trigger-type';

/**
 * Plan template detail structure.
 */
export interface TemplateDescription {
  plan: {
    name: string;
    owner: string;
    stages: StageDescription[];
  };
}

/**
 * Plan template stage.
 */
export interface StageDescription {
  depends_on?: string[];
  name: string;
  trigger_args: TriggerArgs;
  trigger_type: TriggerType;
  steps: StepDescription[];
}

/**
 * Step in stage.
 */
export interface StepDescription {
  is_init?: boolean;
  step_type: string;
  arguments: StepArguments;
  create_named_session?: string;
  use_named_session?: string;
  next?: StepEdgeDescription[];
  output_prefix?: string;
  output_mapping?: OutputMappingDescription[];
  name: string;
}

/**
 * Arguments of a step.
 */
export interface StepArguments {
  attack_module: string;
  attack_module_args: Record<string, string>;
}

/**
 * Edge between steps.
 */
export interface StepEdgeDescription {
  type: string;
  value?: string;
  step: string;
}

/**
 * Step's output mapping.
 */
export interface OutputMappingDescription {
  name_from: string;
  name_to: string;
}
