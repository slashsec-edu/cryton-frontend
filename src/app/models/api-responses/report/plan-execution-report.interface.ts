import { RunState } from '../../types/run-state.type';
import { RunTimes } from './run-times.interface';
import { StageExecutionReport } from './stage-execution-report.interface';

export interface PlanExecutionReport extends RunTimes {
  id: number;
  stage_name: string;
  state: RunState;
  worker_id: number;
  worker_name: string;
  evidence_dir: string;
  stage_executions: StageExecutionReport[];
}
