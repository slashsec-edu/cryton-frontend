import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpTriggerParametersComponent } from '../../../components/http-trigger-parameters/http-trigger-parameters.component';
import { HTTPListenerArgs, HTTPListenerParams, HTTPListenerRoute } from '../../../models/interfaces/http-listener-args';
import { Route } from '../../../models/interfaces/route';
import { StageNode } from '../../dependency-tree/node/stage-node';
import { FormUtils } from './form-utils';
import { TriggerForm } from './trigger-form.interface';

export interface HttpTriggerForm {
  args: FormGroup;
  routes: Route[];
}

export class HttpForm implements TriggerForm {
  formComponent = HttpTriggerParametersComponent;

  private _triggerArgsForm: HttpTriggerForm;

  constructor() {
    this._buildForm();
  }

  getArgsForm(): HttpTriggerForm {
    return this._triggerArgsForm;
  }

  getArgs(): HTTPListenerArgs {
    const host = this._triggerArgsForm.args.get('host').value as string;
    const port = parseInt(this._triggerArgsForm.args.get('port').value, 10);
    const routes: HTTPListenerRoute[] = [];

    this._triggerArgsForm.routes.forEach(route => {
      const path = route.args.get('path').value as string;
      const method = route.args.get('method').value as 'GET' | 'POST';
      const parameters: HTTPListenerParams[] = [];

      route.parameters.forEach(params => {
        parameters.push(params.value);
      });
      routes.push({ path, method, parameters } as HTTPListenerRoute);
    });

    return { host, port, routes } as HTTPListenerArgs;
  }

  isValid(): boolean {
    if (
      !this._triggerArgsForm.args.valid ||
      this._triggerArgsForm.routes.some(route => !route.args.valid || route.parameters.some(params => !params.valid))
    ) {
      return false;
    }
    return true;
  }

  erase(): void {
    this._triggerArgsForm.args.reset();
    this._triggerArgsForm.routes = [this._createRoute(null, null, [this._createParam(null, null)])];
  }

  fill(stage: StageNode): void {
    const httpArgs = (stage.trigger.getArgs() as unknown) as HTTPListenerArgs;

    this._triggerArgsForm.args.setValue({
      host: httpArgs.host,
      port: httpArgs.port
    });

    this._triggerArgsForm.routes = [];
    httpArgs.routes.forEach(route => {
      const params = [];

      route.parameters.forEach(param => {
        params.push(this._createParam(param.name, param.value));
      });

      this._triggerArgsForm.routes.push(this._createRoute(route.path, route.method, params));
    });
  }

  addRoute(): void {
    const newRoute = this._createRoute(null, null, []);
    this._triggerArgsForm.routes.push(newRoute);
    this.addParameter(newRoute);
  }

  addParameter(route: Route): void {
    route.parameters.push(this._createParam(null, null));
  }

  removeRoute(route: Route): void {
    const routeIndex = this._triggerArgsForm.routes.indexOf(route);
    this._triggerArgsForm.routes.splice(routeIndex, 1);
  }

  removeParameter(parameter: FormGroup, route: Route): void {
    const paramIndex = route.parameters.indexOf(parameter);
    route.parameters.splice(paramIndex, 1);
  }

  copy(): HttpForm {
    const copyForm = new HttpForm();

    copyForm._triggerArgsForm.args.setValue(this._triggerArgsForm.args.value);

    copyForm._triggerArgsForm.routes = [];
    this._triggerArgsForm.routes.forEach(route => {
      const params = route.parameters.map(parameters =>
        this._createParam(parameters.get('name').value, parameters.get('value').value)
      );

      copyForm._triggerArgsForm.routes.push(
        this._createRoute(route.args.get('path').value, route.args.get('method').value, params)
      );
    });

    return copyForm;
  }

  markAsUntouched(): void {
    this._triggerArgsForm.args.markAsUntouched();

    this._triggerArgsForm.routes.forEach(route => {
      route.args.markAsUntouched();

      route.parameters.forEach(param => param.markAsUntouched());
    });
  }

  isNotEmpty(): boolean {
    return (
      FormUtils.someValueDefined(this._triggerArgsForm.args.value) ||
      this._triggerArgsForm.routes.some(
        route =>
          FormUtils.someValueDefined(route.args.value) ||
          route.parameters.some(params => FormUtils.someValueDefined(params.value))
      )
    );
  }

  private _createParam(name: string, value: string): FormGroup {
    return new FormGroup({
      name: new FormControl(name, [Validators.required]),
      value: new FormControl(value, [Validators.required])
    });
  }

  private _createRoute(path: string, method: 'GET' | 'POST', parameters: FormGroup[]): Route {
    return {
      args: new FormGroup({
        path: new FormControl(path, [Validators.required]),
        method: new FormControl(method, [Validators.required])
      }),
      parameters
    };
  }

  private _buildForm(): void {
    this._triggerArgsForm = {
      args: new FormGroup({
        host: new FormControl(null, [Validators.required]),
        port: new FormControl(null, [Validators.required])
      }),
      routes: [this._createRoute(null, null, [this._createParam(null, null)])]
    };
  }
}
