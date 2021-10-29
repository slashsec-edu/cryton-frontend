export interface Run {
  url: string;
  id: number;
  plan_executions: string[];
  created_at: string | null;
  updated_at: string | null;
  start_time: string | null;
  schedule_time: string | null;
  pause_time: string | null;
  finish_time: string | null;
  state: string;
  aps_job_id: number;
  plan_model: string;
}
