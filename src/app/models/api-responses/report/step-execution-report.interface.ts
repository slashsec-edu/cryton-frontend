import { RunState } from '../../types/run-state.type';

export interface StepExecutionReport {
  id: number;
  step_name: string;
  state: RunState;
  start_time: string;
  finish_time: string;
  std_err: string;
  std_out: string;
  mod_err: string;
  mod_out: Record<string, unknown>;
  evidence_file: string;
  result: string;
  valid: boolean;
}
