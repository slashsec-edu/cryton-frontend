import { RunState } from '../../types/run-state.type';
import { PlanExecutionReport } from './plan-execution-report.interface';
import { RunTimes } from './run-times.interface';

export interface Report extends RunTimes {
  id: number;
  plan_id: number;
  plan_name: string;
  state: RunState;
  plan_executions: PlanExecutionReport[];
}
