export class NodeNameNotUniqueError extends Error {
  constructor(nodeName: string) {
    super(`Node name "${nodeName}" is not unique in the dependency graph.`);
  }
}
