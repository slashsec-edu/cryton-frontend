import { Run } from '../../models/api-responses/run.interface';

export const runs: Run[] = [
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/1/',
    id: 1,
    plan_executions: ['http://localhost:8000/cryton/api/v1/plan_executions/1/'],
    created_at: '2020-06-29T16:45:23.615123',
    updated_at: '2020-06-29T16:45:23.615136',
    start_time: '2020-05-12T16:50:23.615136',
    schedule_time: null,
    pause_time: null,
    finish_time: null,
    state: 'SCHEDULED',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/1/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/2/',
    id: 2,
    plan_executions: [
      'http://localhost:8000/cryton/api/v1/plan_executions/5/',
      'http://localhost:8000/cryton/api/v1/plan_executions/9/'
    ],
    created_at: '2020-06-29T16:46:53.539149',
    updated_at: '2020-06-29T16:46:53.539160',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'PENDING',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/2/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/3/',
    id: 3,
    plan_executions: [
      'http://localhost:8000/cryton/api/v1/plan_executions/13/',
      'http://localhost:8000/cryton/api/v1/plan_executions/17/'
    ],
    created_at: '2020-06-29T16:47:30.765240',
    updated_at: '2020-06-29T16:47:30.765252',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'RUNNING',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/3/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/4/',
    id: 4,
    plan_executions: [
      'http://localhost:8000/cryton/api/v1/plan_executions/21/',
      'http://localhost:8000/cryton/api/v1/plan_executions/25/'
    ],
    created_at: '2020-06-29T16:47:38.188259',
    updated_at: '2020-06-29T16:47:38.188270',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'PENDING',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/4/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/5/',
    id: 5,
    plan_executions: [
      'http://localhost:8000/cryton/api/v1/plan_executions/29/',
      'http://localhost:8000/cryton/api/v1/plan_executions/33/'
    ],
    created_at: '2020-06-29T16:47:48.137229',
    updated_at: '2020-06-29T16:47:48.137241',
    start_time: '2020-06-29T16:47:48.137229',
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'FINISHED',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/1/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/6/',
    id: 6,
    plan_executions: ['http://localhost:8000/cryton/api/v1/plan_executions/37/'],
    created_at: '2020-06-29T16:48:06.314021',
    updated_at: '2020-06-29T16:48:06.314032',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'PAUSING',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/1/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/7/',
    id: 7,
    plan_executions: ['http://localhost:8000/cryton/api/v1/plan_executions/41/'],
    created_at: '2020-06-29T16:48:15.810439',
    updated_at: '2020-06-29T16:48:15.810451',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'PAUSED',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/3/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/8/',
    id: 8,
    plan_executions: ['http://localhost:8000/cryton/api/v1/plan_executions/45/'],
    created_at: '2020-06-29T16:48:20.064168',
    updated_at: '2020-06-29T16:48:20.064178',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'PENDING',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/2/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/9/',
    id: 9,
    plan_executions: [
      'http://localhost:8000/cryton/api/v1/plan_executions/49/',
      'http://localhost:8000/cryton/api/v1/plan_executions/53/'
    ],
    created_at: '2020-07-05T10:07:05.800595',
    updated_at: '2020-07-05T10:07:05.800607',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'FINISHED',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/1/'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/runs/10/',
    id: 10,
    plan_executions: [
      'http://localhost:8000/cryton/api/v1/plan_executions/49/',
      'http://localhost:8000/cryton/api/v1/plan_executions/53/'
    ],
    created_at: '2020-07-05T10:07:05.800595',
    updated_at: '2020-07-05T10:07:05.800607',
    start_time: null,
    pause_time: null,
    finish_time: null,
    schedule_time: null,
    state: 'FINISHED',
    aps_job_id: null,
    plan_model: 'http://localhost:8000/cryton/api/v1/plans/1/'
  }
];
