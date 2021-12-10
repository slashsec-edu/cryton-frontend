export interface Worker {
  url: string;
  id: number;
  name: string;
  address: string;
  q_prefix: string;
  state: string;
}

export interface WorkerExecution extends Worker {
  execution_url: string;
}
