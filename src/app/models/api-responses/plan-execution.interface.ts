export interface PlanExecution {
  id: number;
  url: string;
  created_at: string;
  updated_at: string;
  start_time: string;
  pause_time: string;
  finish_time: string;
  state: string;
  aps_job_id: number;
  evidence_dir: string;
  run: string;
  plan_model: string;
  worker: string;
}
