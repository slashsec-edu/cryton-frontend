const PAUSE_COLOR = '#969696';
const ERROR_COLOR = '#ff0000';
const WAITING_COLOR = '#ffb23b';
const EXECUTING_COLOR = '#448AFF';
const SUCCESS_COLOR = '#5FBB62';

export const FILL_MAP: Record<string, string> = {
  paused: PAUSE_COLOR,
  pausing: PAUSE_COLOR,
  running: EXECUTING_COLOR,
  pending: WAITING_COLOR,
  finished: SUCCESS_COLOR,
  ignore: ERROR_COLOR,
  error: ERROR_COLOR,
  terminated: ERROR_COLOR,
  waiting: WAITING_COLOR,
  awaiting: WAITING_COLOR
};
