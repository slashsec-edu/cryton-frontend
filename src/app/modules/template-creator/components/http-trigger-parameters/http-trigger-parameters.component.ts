import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { HttpForm, HttpTriggerForm } from '../../classes/stage-creation/forms/http-form';
import { TriggerParameters } from '../../classes/stage-creation/trigger-parameters';
import { ERROR_MESSAGES } from './http-trigger.errors';

@Component({
  selector: 'app-http-trigger-parameters',
  templateUrl: './http-trigger-parameters.component.html',
  styleUrls: ['./http-trigger-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HttpTriggerParametersComponent extends TriggerParameters implements OnInit {
  @Input() triggerForm: HttpForm;

  httpTriggerForm: HttpTriggerForm;

  constructor() {
    super(ERROR_MESSAGES);
  }

  ngOnInit(): void {
    this.httpTriggerForm = this.triggerForm.getArgsForm();
  }
}
