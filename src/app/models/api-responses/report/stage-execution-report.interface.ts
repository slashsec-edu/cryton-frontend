import { RunState } from '../../types/run-state.type';
import { RunTimes } from './run-times.interface';
import { StepExecutionReport } from './step-execution-report.interface';

export interface StageExecutionReport extends RunTimes {
  id: number;
  stage_name: string;
  state: RunState;
  step_executions: StepExecutionReport[];
}
