import { Report } from 'src/app/models/api-responses/report/report.interface';

/* eslint-disable max-len */
export const mockReport: Report = {
  id: 5,
  plan_id: 2,
  plan_name: 'Example scenario',
  state: 'FINISHED',
  start_time: '2020-11-01T22:20:10.208170',
  finish_time: '2020-11-02T02:29:30.913794',
  pause_time: null,
  plan_executions: [
    {
      id: 1,
      stage_name: 'Example scenario',
      state: 'FINISHED',
      start_time: '2020-11-01T22:20:09.964302',
      finish_time: '2020-11-02T02:29:25.913794',
      pause_time: null,
      worker_id: 1,
      worker_name: 'test',
      evidence_dir: '/root/.cryton/evidence/plan_001-Example_scenario/run_1/worker_test',
      stage_executions: [
        {
          id: 1,
          stage_name: 'stage-one',
          state: 'FINISHED',
          start_time: '2020-11-01T22:20:14.964302',
          finish_time: null,
          pause_time: null,
          step_executions: [
            {
              id: 1,
              step_name: 'scan-localhost',
              state: 'FINISHED',
              start_time: '2020-11-01T22:20:15.083197',
              finish_time: '2020-11-01T22:21:10.279528',
              result: 'OK',
              mod_out: {
                open_ports: {
                  ssh: '22'
                }
              },
              mod_err: 'No error',
              std_out:
                '[{"host": "127.0.0.1", "hostname": "localhost", "hostname_type": "PTR", "protocol": "tcp", "port": "22", "name": "ssh", "state": "open", "product": "OpenSSH", "extrainfo": "protocol 2.0", "reason": "syn-ack", "version": "8.1p1 Debian 1", "conf": "10", "cpe": "cpe:/o:linux:linux_kernel"}]',
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            },
            {
              id: 2,
              step_name: 'bruteforce',
              state: 'PENDING',
              start_time: '2020-11-01T22:21:10.410417',
              finish_time: '2020-11-01T22:21:13.496688',
              result: 'OK',
              mod_out: {
                password: 'vagrant',
                username: 'vagrant'
              },
              mod_err: 'No error',
              std_out: "{'username': 'vagrant', 'password': 'vagrant'}",
              std_err: null,
              evidence_file: '/tmp/1604269273',
              valid: false
            },
            {
              id: 3,
              step_name: 'ssh-session',
              state: 'PAUSED',
              start_time: '2020-11-01T22:21:13.642667',
              finish_time: '2020-11-01T22:21:24.913794',
              result: 'OK',
              mod_out: null,
              mod_err: null,
              std_out:
                "RHOSTS => 127.0.0.1\nPASSWORD => vagrant\nUSERNAME => vagrant\n[*] Auxiliary module running as background job 45.\n[+] 127.0.0.1:22 - Success: 'vagrant:vagrant' ''\n[*] Command shell session 46 opened (127.0.0.1:46721 -> 127.0.0.1:22) at 2020-11-01 23:21:23 +0100\n[*] Scanned 1 of 1 hosts (100% complete)\n",
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            },
            {
              id: 4,
              step_name: 'session-cmd',
              state: 'RUNNING',
              start_time: '2020-11-01T22:21:25.028513',
              finish_time: '2020-11-01T22:21:29.186426',
              result: 'UNKNOWN',
              mod_out: {
                cmd_out:
                  'Linux kali 5.3.0-kali2-amd64 #1 SMP Debian 5.3.9-3kali1 (2019-11-20) x86_64\nThe programs included with the Kali GNU/Linux system are free software; the exact distribution terms for each program are described in the individual files in /usr/share/doc/*/copyright.\nKali GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law. root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin ... '
              },
              mod_err: 'No error',
              std_out:
                'Linux kali 5.3.0-kali2-amd64 #1 SMP Debian 5.3.9-3kali1 (2019-11-20) x86_64\n\nThe programs included with the Kali GNU/Linux system are free software; the exact distribution terms for each program are described in the individual files in /usr/share/doc/*/copyright.\nKali GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law. root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin ... ',
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            }
          ]
        },
        {
          id: 2,
          stage_name: 'stage-two',
          state: 'PAUSED',
          start_time: '2020-11-01T22:20:20.000000',
          finish_time: null,
          pause_time: null,
          step_executions: [
            {
              id: 1,
              step_name: 'scan-localhost',
              state: 'IGNORE',
              start_time: '2020-11-01T22:20:20.000000',
              finish_time: '2020-11-01T22:20:22.000000',
              result: 'OK',
              mod_out: {
                open_ports: {
                  ssh: '22'
                }
              },
              mod_err: 'No error',
              std_out:
                '[{"host": "127.0.0.1", "hostname": "localhost", "hostname_type": "PTR", "protocol": "tcp", "port": "22", "name": "ssh", "state": "open", "product": "OpenSSH", "extrainfo": "protocol 2.0", "reason": "syn-ack", "version": "8.1p1 Debian 1", "conf": "10", "cpe": "cpe:/o:linux:linux_kernel"}]',
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            },
            {
              id: 2,
              step_name: 'bruteforce',
              state: 'ERROR',
              start_time: '2020-11-01T22:20:23.000000',
              finish_time: '2020-11-01T22:20:25.000000',
              result: 'OK',
              mod_out: {
                password: 'vagrant',
                username: 'vagrant'
              },
              mod_err: 'No error',
              std_out: "{'username': 'vagrant', 'password': 'vagrant'}",
              std_err: null,
              evidence_file: '/tmp/1604269273',
              valid: false
            },
            {
              id: 3,
              step_name: 'ssh-session',
              state: 'FINISHED',
              start_time: '2020-11-01T22:20:29.000000',
              finish_time: '2020-11-01T22:20:31.913794',
              result: 'OK',
              mod_out: null,
              mod_err: null,
              std_out:
                "RHOSTS => 127.0.0.1\nPASSWORD => vagrant\nUSERNAME => vagrant\n[*] Auxiliary module running as background job 45.\n[+] 127.0.0.1:22 - Success: 'vagrant:vagrant' ''\n[*] Command shell session 46 opened (127.0.0.1:46721 -> 127.0.0.1:22) at 2020-11-01 23:21:23 +0100\n[*] Scanned 1 of 1 hosts (100% complete)\n",
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            },
            {
              id: 4,
              step_name: 'session-cmd',
              state: 'RUNNING',
              start_time: '2020-11-01T22:20:34.000000',
              finish_time: '2020-11-01T22:20:35.000000',
              result: 'UNKNOWN',
              mod_out: {
                cmd_out:
                  'Linux kali 5.3.0-kali2-amd64 #1 SMP Debian 5.3.9-3kali1 (2019-11-20) x86_64\nThe programs included with the Kali GNU/Linux system are free software; the exact distribution terms for each program are described in the individual files in /usr/share/doc/*/copyright.\nKali GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law. root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin ... '
              },
              mod_err: 'No error',
              std_out:
                'Linux kali 5.3.0-kali2-amd64 #1 SMP Debian 5.3.9-3kali1 (2019-11-20) x86_64\n\nThe programs included with the Kali GNU/Linux system are free software; the exact distribution terms for each program are described in the individual files in /usr/share/doc/*/copyright.\nKali GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent permitted by applicable law. root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin ... ',
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            }
          ]
        }
      ]
    },
    {
      id: 2,
      stage_name: 'Example scenario',
      state: 'FINISHED',
      start_time: '2020-11-01T22:20:09.964302',
      finish_time: null,
      pause_time: null,
      worker_id: 1,
      worker_name: 'seconds worker',
      evidence_dir: '/root/.cryton/evidence/plan_001-Example_scenario/run_1/worker_test',
      stage_executions: [
        {
          id: 1,
          stage_name: 'stage-one',
          state: 'PENDING',
          start_time: '2020-11-01T22:20:14.964302',
          finish_time: null,
          pause_time: null,
          step_executions: [
            {
              id: 1,
              step_name: 'scan-localhost',
              state: 'FINISHED',
              start_time: '2020-11-01T22:20:15.083197',
              finish_time: '2020-11-01T22:21:10.279528',
              result: 'OK',
              mod_out: {
                open_ports: {
                  ssh: '22'
                }
              },
              mod_err: 'No error',
              std_out:
                '[{"host": "127.0.0.1", "hostname": "localhost", "hostname_type": "PTR", "protocol": "tcp", "port": "22", "name": "ssh", "state": "open", "product": "OpenSSH", "extrainfo": "protocol 2.0", "reason": "syn-ack", "version": "8.1p1 Debian 1", "conf": "10", "cpe": "cpe:/o:linux:linux_kernel"}]',
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            },
            {
              id: 2,
              step_name: 'bruteforce',
              state: 'PENDING',
              start_time: '2020-11-01T22:21:10.410417',
              finish_time: '2020-11-01T22:21:13.496688',
              result: 'OK',
              mod_out: {
                password: 'vagrant',
                username: 'vagrant'
              },
              mod_err: 'No error',
              std_out: "{'username': 'vagrant', 'password': 'vagrant'}",
              std_err: null,
              evidence_file: '/tmp/1604269273',
              valid: false
            },
            {
              id: 3,
              step_name: 'ssh-session',
              state: 'PAUSED',
              start_time: '2020-11-01T22:21:13.642667',
              finish_time: '2020-11-01T22:21:24.913794',
              result: 'OK',
              mod_out: null,
              mod_err: null,
              std_out:
                "RHOSTS => 127.0.0.1\nPASSWORD => vagrant\nUSERNAME => vagrant\n[*] Auxiliary module running as background job 45.\n[+] 127.0.0.1:22 - Success: 'vagrant:vagrant' ''\n[*] Command shell session 46 opened (127.0.0.1:46721 -> 127.0.0.1:22) at 2020-11-01 23:21:23 +0100\n[*] Scanned 1 of 1 hosts (100% complete)\n",
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            }
          ]
        }
      ]
    },
    {
      id: 3,
      stage_name: 'example_stage',
      state: 'PAUSED',
      start_time: '2020-11-01T22:20:09.964302',
      finish_time: null,
      pause_time: null,
      worker_id: 1,
      worker_name: 'seconds worker',
      evidence_dir: '/root/.cryton/evidence/plan_001-Example_scenario/run_1/worker_test',
      stage_executions: [
        {
          id: 1,
          stage_name:
            'Very long stage name hehehehehehassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssaaaaaaaaaaaaaa.',
          state: 'PENDING',
          start_time: '2020-11-01T22:20:14.964302',
          finish_time: null,
          pause_time: null,
          step_executions: [
            {
              id: 1,
              step_name: 'scan-localhost',
              state: 'FINISHED',
              start_time: '2020-11-01T22:20:15.083197',
              finish_time: '2020-11-01T23:21:10.279528',
              result: 'OK',
              mod_out: {
                open_ports: {
                  ssh: '22'
                }
              },
              mod_err: 'No error',
              std_out:
                '[{"host": "127.0.0.1", "hostname": "localhost", "hostname_type": "PTR", "protocol": "tcp", "port": "22", "name": "ssh", "state": "open", "product": "OpenSSH", "extrainfo": "protocol 2.0", "reason": "syn-ack", "version": "8.1p1 Debian 1", "conf": "10", "cpe": "cpe:/o:linux:linux_kernel"}]',
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            },
            {
              id: 2,
              step_name: 'bruteforce',
              state: 'PENDING',
              start_time: '2020-11-01T23:21:10.410417',
              finish_time: '2020-11-02T02:21:13.496688',
              result: 'OK',
              mod_out: {
                password: 'vagrant',
                username: 'vagrant'
              },
              mod_err: 'No error',
              std_out: "{'username': 'vagrant', 'password': 'vagrant'}",
              std_err: null,
              evidence_file: '/tmp/1604269273',
              valid: false
            },
            {
              id: 3,
              step_name: 'ssh-session',
              state: 'PAUSED',
              start_time: '2020-11-02T02:25:18.642667',
              finish_time: '2020-11-02T02:29:24.913794',
              result: 'OK',
              mod_out: null,
              mod_err: null,
              std_out:
                "RHOSTS => 127.0.0.1\nPASSWORD => vagrant\nUSERNAME => vagrant\n[*] Auxiliary module running as background job 45.\n[+] 127.0.0.1:22 - Success: 'vagrant:vagrant' ''\n[*] Command shell session 46 opened (127.0.0.1:46721 -> 127.0.0.1:22) at 2020-11-01 23:21:23 +0100\n[*] Scanned 1 of 1 hosts (100% complete)\n",
              std_err: null,
              evidence_file: 'No evidence',
              valid: false
            }
          ]
        }
      ]
    }
  ]
};
