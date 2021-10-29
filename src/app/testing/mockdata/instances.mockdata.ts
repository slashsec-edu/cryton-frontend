import { Instance } from '../../models/api-responses/instance.interface';

export const instances: Instance[] = [
  {
    url: 'http://localhost:8000/cryton/api/v1/plans/2/',
    id: 2,
    runs: [
      'http://localhost:8000/cryton/api/v1/runs/8/',
      'http://localhost:8000/cryton/api/v1/runs/9/',
      'http://localhost:8000/cryton/api/v1/runs/10/'
    ],
    stages: ['http://localhost:8000/cryton/api/v1/stages/2/'],
    created_at: '2020-08-24T12:22:55.909039',
    updated_at: '2020-08-24T12:22:56.024864',
    name: 'Example scenario',
    owner: 'your name',
    evidence_dir: '/root/.cryton/evidence/plan_002-Example_scenario'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/plans/3/',
    id: 3,
    runs: ['http://localhost:8000/cryton/api/v1/runs/5/'],
    stages: ['http://localhost:8000/cryton/api/v1/stages/3/'],
    created_at: '2020-08-24T12:22:56.873167',
    updated_at: '2020-08-24T12:22:57.597889',
    name: 'Example scenario',
    owner: 'your name',
    evidence_dir: '/root/.cryton/evidence/plan_003-Example_scenario'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/plans/4/',
    id: 4,
    runs: ['http://localhost:8000/cryton/api/v1/runs/11/'],
    stages: ['http://localhost:8000/cryton/api/v1/stages/4/'],
    created_at: '2020-08-24T12:23:01.564407',
    updated_at: '2020-08-24T12:23:01.705385',
    name: 'Example scenario',
    owner: 'your name',
    evidence_dir: '/root/.cryton/evidence/plan_004-Example_scenario'
  }
];
