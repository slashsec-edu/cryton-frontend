import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CrytonStage } from './cryton-stage';
import { NodeManager } from '../dependency-tree/node-manager';
import { TriggerType } from '../../models/enums/trigger-type';
import { Route } from '../../models/interfaces/route';
import { DeltaArgs } from '../../models/interfaces/delta-args';
import { HTTPListenerArgs, HTTPListenerParams, HTTPListenerRoute } from '../../models/interfaces/http-listener-args';

export class StageForm {
  formArgs: FormGroup;
  formDeltaArgs: FormGroup;
  formHttpListenerArgs: {
    args: FormGroup;
    routes: Route[];
  };

  ignoredName = null;

  private _nodeManager: NodeManager;

  get name(): string {
    return this.formArgs.get('name').value as string;
  }

  get triggerType(): TriggerType {
    return this.formArgs.get('triggerType').value as TriggerType;
  }

  get delta(): DeltaArgs {
    const hours = parseInt(this.formDeltaArgs.get('hours').value as string, 10) ?? 0;
    const minutes = parseInt(this.formDeltaArgs.get('minutes').value as string, 10) ?? 0;
    const seconds = parseInt(this.formDeltaArgs.get('seconds').value as string, 10) ?? 0;
    return { hours, minutes, seconds };
  }

  get httpListenerArgs(): HTTPListenerArgs {
    const host = this.formHttpListenerArgs.args.get('host').value as string;
    const port = Number(this.formHttpListenerArgs.args.get('port').value);
    const routes: HTTPListenerRoute[] = [];

    this.formHttpListenerArgs.routes.forEach(route => {
      const path = route.args.get('path').value as string;
      const method = route.args.get('method').value as 'GET' | 'POST';
      const parameters: HTTPListenerParams[] = [];

      route.parameters.forEach(params => {
        parameters.push(params.value);
      });
      routes.push({ path, method, parameters });
    });

    return { host, port, routes };
  }

  constructor(nodeManager: NodeManager) {
    this._nodeManager = nodeManager;

    this.formArgs = new FormGroup({
      name: new FormControl(null, [Validators.required, this._uniqueNameValidator]),
      triggerType: new FormControl('Delta', [Validators.required])
    });

    this.formDeltaArgs = new FormGroup({
      hours: new FormControl(null, [Validators.min(0), Validators.required]),
      minutes: new FormControl(null, [Validators.min(0), Validators.max(59), Validators.required]),
      seconds: new FormControl(null, [Validators.min(0), Validators.max(59), Validators.required])
    });

    this.formHttpListenerArgs = {
      args: new FormGroup({
        host: new FormControl(null, [Validators.required]),
        port: new FormControl(null, [Validators.required])
      }),
      routes: [this.createRoute(null, null, [this.createParam(null, null)])]
    };
  }

  getArgs(): Record<string, any> {
    switch (this.triggerType) {
      case TriggerType.DELTA:
        return this.delta;
      case TriggerType.HTTP_LISTENER:
        return this.httpListenerArgs;
      default:
        throw new Error('Unknown trigger type.');
    }
  }

  isValid(): boolean {
    const triggerType = this.formArgs.get('triggerType').value as string;

    if (!this.formArgs.valid) {
      return false;
    }
    if (triggerType === TriggerType.DELTA) {
      if (!this.formDeltaArgs.valid) {
        return false;
      }
    } else if (triggerType === TriggerType.HTTP_LISTENER) {
      if (
        !this.formHttpListenerArgs.args.valid ||
        this.formHttpListenerArgs.routes.some(
          route => !route.args.valid || route.parameters.some(params => !params.valid)
        )
      ) {
        return false;
      }
    }
    return true;
  }

  erase(): void {
    this.formArgs.reset();
    this.formDeltaArgs.reset();
    this.formHttpListenerArgs.args.reset();
    this.formHttpListenerArgs.routes = [this.createRoute(null, null, [this.createParam(null, null)])];
  }

  copy(): StageForm {
    const copyForm = new StageForm(this._nodeManager);

    copyForm.formArgs.setValue(this.formArgs.value);
    copyForm.formDeltaArgs.setValue(this.formDeltaArgs.value);
    copyForm.formHttpListenerArgs.args.setValue(this.formHttpListenerArgs.args.value);

    copyForm.formHttpListenerArgs.routes = [];
    this.formHttpListenerArgs.routes.forEach(route => {
      const params = route.parameters.map(parameters =>
        this.createParam(parameters.get('name').value, parameters.get('value').value)
      );

      copyForm.formHttpListenerArgs.routes.push(
        this.createRoute(route.args.get('path').value, route.args.get('method').value, params)
      );
    });

    return copyForm;
  }

  isNotEmpty(): boolean {
    if (this._someValueDefined(this.formArgs.value)) {
      return true;
    }
    if (this._someValueDefined(this.formDeltaArgs.value)) {
      return true;
    }
    if (this._someValueDefined(this.formHttpListenerArgs.args.value)) {
      return true;
    }
    if (
      this.formHttpListenerArgs.routes.some(
        route =>
          this._someValueDefined(route.args.value) ||
          route.parameters.some(params => this._someValueDefined(params.value))
      )
    ) {
      return true;
    }
    return false;
  }

  createParam(name: string, value: string): FormGroup {
    return new FormGroup({
      name: new FormControl(name, [Validators.required]),
      value: new FormControl(value, [Validators.required])
    });
  }

  createRoute(path: string, method: 'GET' | 'POST', parameters: FormGroup[]): Route {
    return {
      args: new FormGroup({
        path: new FormControl(path, [Validators.required]),
        method: new FormControl(method, [Validators.required])
      }),
      parameters
    };
  }

  addRoute(): void {
    this.formHttpListenerArgs.routes.push(this.createRoute(null, null, []));
  }

  addParameter(route: Route): void {
    route.parameters.push(this.createParam(null, null));
  }

  removeRoute(route: Route): void {
    const routeIndex = this.formHttpListenerArgs.routes.indexOf(route);
    this.formHttpListenerArgs.routes.splice(routeIndex, 1);
  }

  removeParameter(parameter: FormGroup, route: Route): void {
    const paramIndex = route.parameters.indexOf(parameter);
    route.parameters.splice(paramIndex, 1);
  }

  fillParamsFromStage(stage: CrytonStage): void {
    this.formArgs.setValue({
      name: stage.name,
      triggerType: stage.trigger.getType()
    });

    if (stage.trigger.getType() === TriggerType.DELTA) {
      this.formDeltaArgs.setValue(stage.trigger.getArgs());
    } else if (stage.trigger.getType() === TriggerType.HTTP_LISTENER) {
      const httpArgs = (stage.trigger.getArgs() as unknown) as HTTPListenerArgs;

      this.formHttpListenerArgs.args.setValue({
        host: httpArgs.host,
        port: httpArgs.port
      });

      this.formHttpListenerArgs.routes = [];
      httpArgs.routes.forEach(route => {
        const params = [];

        route.parameters.forEach(param => {
          params.push(this.createParam(param.name, param.value));
        });

        this.formHttpListenerArgs.routes.push(this.createRoute(route.path, route.method, params));
      });
    }
  }

  private _someValueDefined(object: Record<string, string>): boolean {
    return Object.values(object).some(value => value);
  }

  private _uniqueNameValidator = (control: AbstractControl): ValidationErrors | null =>
    this._nodeManager.isNodeNameUnique(control.value, this.ignoredName) ? null : { notUnique: true };
}
