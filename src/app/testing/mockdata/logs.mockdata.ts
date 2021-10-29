import { LogsResponse } from 'src/app/services/log.service';

export const mockLogs: LogsResponse = {
  count: 17,
  next: undefined,
  previous: undefined,
  results: [
    '2021-10-07 07:13:57,022.022 INFO [140328174938952] {run} [schedule] {"run_id": 5, "status": "success", "event": "run scheduled", "logger": "cryton", "level": "info", "timestamp": "2021-10-07T07:13:57.022035Z"}',
    '2021-10-07 07:14:02,908.908 INFO [140328174938952] {run} [unschedule] {"run_id": 5, "status": "success", "event": "run unscheduled", "logger": "cryton", "level": "info", "timestamp": "2021-10-07T07:14:02.908540Z"}',
    '2021-10-07 07:14:17,693.693 INFO [140328174938952] {run} [schedule] {"run_id": 5, "status": "success", "event": "run scheduled", "logger": "cryton", "level": "info", "timestamp": "2021-10-07T07:14:17.693861Z"}',
    '2021-10-11 09:51:35,765.765 INFO [140704550173512] {run} [unschedule] {"run_id": 5, "status": "success", "event": "run unscheduled", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:35.764958Z"}',
    '2021-10-11 09:51:42,005.005 INFO [140704550173512] {run} [pause] {"run_id": 4, "status": "success", "event": "run pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:42.005420Z"}',
    '2021-10-11 09:51:42,025.025 INFO [140704550173512] {plan} [pause] {"plan_name": "Example scenario", "status": "success", "event": "planexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:42.025149Z"}',
    '2021-10-11 09:51:42,036.036 INFO [140704550173512] {trigger_delta} [pause] {"stage_execution_id": 9, "event": "stageexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:42.036604Z"}',
    '2021-10-11 09:51:42,064.064 INFO [140704550173512] {plan} [pause] {"plan_name": "Example scenario", "status": "success", "event": "planexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:42.064855Z"}',
    '2021-10-11 09:51:42,073.073 INFO [140704550173512] {trigger_delta} [pause] {"stage_execution_id": 10, "event": "stageexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:42.073069Z"}',
    '2021-10-11 09:51:43,966.966 INFO [140704550173512] {run} [pause] {"run_id": 1, "status": "success", "event": "run pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:43.965958Z"}',
    '2021-10-11 09:51:43,983.983 INFO [140704550173512] {plan} [pause] {"plan_name": "Example scenario", "status": "success", "event": "planexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:43.983141Z"}',
    '2021-10-11 09:51:43,990.990 INFO [140704550173512] {trigger_delta} [pause] {"stage_execution_id": 1, "event": "stageexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:43.990348Z"}',
    '2021-10-11 09:51:44,010.010 INFO [140704550173512] {plan} [pause] {"plan_name": "Example scenario", "status": "success", "event": "planexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:44.010553Z"}',
    '2021-10-11 09:51:44,018.018 INFO [140704550173512] {trigger_delta} [pause] {"stage_execution_id": 2, "event": "stageexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:44.018675Z"}',
    '2021-10-11 09:51:44,041.041 INFO [140704550173512] {plan} [pause] {"plan_name": "Example scenario", "status": "success", "event": "planexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:44.041664Z"}',
    '2021-10-11 09:51:44,050.050 INFO [140704550173512] {trigger_delta} [pause] {"stage_execution_id": 3, "event": "stageexecution pausing", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:44.050702Z"}',
    '2021-10-11 09:51:48,945.945 INFO [140704550173512] {run} [schedule] {"run_id": 5, "status": "success", "event": "run scheduled", "logger": "cryton", "level": "info", "timestamp": "2021-10-11T09:51:48.945111Z"}'
  ]
};
