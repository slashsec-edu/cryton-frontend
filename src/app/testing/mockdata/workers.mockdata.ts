import { Worker } from '../../models/api-responses/worker.interface';

export const workers: Worker[] = [
  {
    url: 'http://localhost:8000/cryton/api/v1/workers/1/',
    id: 1,
    name: 'Worker 1',
    address: '127.0.0.1',
    q_prefix: '15',
    state: 'UP'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/workers/2/',
    id: 2,
    name: 'Worker 2',
    address: '252.3.15.8',
    q_prefix: '20',
    state: 'DOWN'
  },
  {
    url: 'http://localhost:8000/cryton/api/v1/workers/2/',
    id: 3,
    name: 'Worker 3',
    address: '251.3.16.8',
    q_prefix: '3',
    state: 'READY'
  }
];
