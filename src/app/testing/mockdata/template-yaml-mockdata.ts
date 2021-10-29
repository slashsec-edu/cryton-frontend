export const simpleTemplate = `---
plan:
  name: Example scenario
  owner: your name
  stages:
  - name: stage-one
    trigger_type: delta
    trigger_args:
      seconds: 5
    steps:
    - name: scan-localhost
      is_init: true
      attack_module: mod_nmap/mod_nmap
      attack_module_args:
        target: 127.0.0.1
        ports:
          - 22
      next:
        - type: result
          value: OK
          step: bruteforce
    - name: bruteforce
      attack_module: mod_medusa/mod_medusa
      attack_module_args:
        target: 127.0.0.1
        open_ports: $parent.open_ports
        username: vagrant
        password: vagrant
      next:
      - type: result
        value: OK
        step: ssh-session
    - name: ssh-session
      create_named_session: session_to_target_1
      attack_module: mod_msf/mod_msf
      attack_module_args:
        exploit: auxiliary/scanner/ssh/ssh_login
        exploit_arguments:
          RHOSTS: 127.0.0.1
          USERNAME: $parent.username
          PASSWORD: $parent.password
      next:
        - type: result
          value: OK
          step: session-cmd
    - name: session-cmd
      attack_module: mod_cmd/mod_cmd
      use_named_session: session_to_target_1
      attack_module_args:
          cmd: cat /etc/passwd
`;

export const longTemplate = `---
plan:
  name: Example scenario
  owner: your name
  stages:
    - name: Stage three
      trigger_type: delta
      trigger_args:
        hours: 0
        minutes: 0
        seconds: 5
      steps:
        - name: scan-localhost
          attack_module: mod_nmap/mod_nmap
          attack_module_args:
            target: 127.0.0.1
            ports:
              - 22
          is_init: true
          next:
            - step: bruteforce
              type: result
              value: OK
        - name: bruteforce
          attack_module: mod_medusa/mod_medusa
          attack_module_args:
            target: 127.0.0.1
            open_ports: $parent.open_ports
            username: vagrant
            password: vagrant
          next:
            - step: ssh-session
              type: result
              value: OK
        - name: ssh-session
          attack_module: mod_msf/mod_msf
          attack_module_args:
            exploit: auxiliary/scanner/ssh/ssh_login
            exploit_arguments:
              RHOSTS: 127.0.0.1
              USERNAME: $parent.username
              PASSWORD: $parent.password
          next:
            - step: session-cmd
              type: result
              value: OK
        - name: session-cmd
          attack_module: mod_cmd/mod_cmd
          attack_module_args:
            cmd: cat /etc/passwd
    - name: Stage one
      trigger_type: delta
      trigger_args:
        hours: 0
        minutes: 30
        seconds: 0
      steps:
        - name: a
          attack_module: a
          attack_module_args: a
          is_init: true
          next:
            - step: b
              type: return_code
              value: "5"
            - step: c
              type: result
              value: OK
        - name: b
          attack_module: b
          attack_module_args: b
        - name: c
          attack_module: c
          attack_module_args: c
      depends_on:
        - Stage three
    - name: Stage two
      trigger_type: delta
      trigger_args:
        hours: 0
        minutes: 45
        seconds: 30
      steps:
        - name: a
          attack_module: a
          attack_module_args: a
          next:
            - step: f
              type: return_code
              value: "4"
        - name: s
          attack_module: s
          attack_module_args: s
        - name: d
          attack_module: d
          attack_module_args: d
        - name: f
          attack_module: f
          attack_module_args: f
        - name: g
          attack_module: g
          attack_module_args: g
          next:
            - step: s
              type: state
              value: ss
            - step: d
              type: result
              value: "2"
        - name: h
          attack_module: h
          attack_module_args: h
          is_init: true
          next:
            - step: a
              type: return_code
              value: "2"
            - step: g
              type: return_code
              value: "3"
            - step: s
              type: return_code
              value: "5"
      depends_on:
        - Stage three
    - name: asd
      trigger_type: delta
      trigger_args:
        hours: 2
        minutes: 0
        seconds: 0
      steps:
        - name: Special Step
          attack_module: a
          attack_module_args: a
          is_init: true
`;

export const stageTwoTemplate = `---
plan:
  name: Example scenario
  owner: your name
  stages:
    - name: Stage two
      trigger_type: delta
      trigger_args:
        hours: 0
        minutes: 45
        seconds: 30
      steps:
        - name: a
          attack_module: a
          attack_module_args: a
          next:
            - step: f
              type: return_code
              value: "4"
        - name: s
          attack_module: s
          attack_module_args: s
        - name: d
          attack_module: d
          attack_module_args: d
        - name: f
          attack_module: f
          attack_module_args: f
        - name: g
          attack_module: g
          attack_module_args: g
          next:
            - step: s
              type: state
              value: ss
            - step: d
              type: result
              value: "2"
        - name: h
          attack_module: h
          attack_module_args: h
          is_init: true
          next:
            - step: a
              type: return_code
              value: "2"
            - step: g
              type: return_code
              value: "3"
            - step: s
              type: return_code
              value: "5"
`;
