/**
 * HTTP listener stage trigger parameters.
 */
export interface HTTPListenerArgs {
  host: string;
  port: number;
  routes: HTTPListenerRoute[];
}

/**
 * HTTP listener route.
 */
export interface HTTPListenerRoute {
  path: string;
  method: 'GET' | 'POST';
  parameters: HTTPListenerParams[];
}

/**
 * HTTP listener route parameters.
 */
export interface HTTPListenerParams {
  name: string;
  value: string;
}
