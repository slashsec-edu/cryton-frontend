export interface Plan {
  url: string;
  id: number;
  runs: string[];
  stages: string[];
  created_at: string;
  updated_at: string;
  name: string;
  owner: string;
  evidence_dir: string;
}
