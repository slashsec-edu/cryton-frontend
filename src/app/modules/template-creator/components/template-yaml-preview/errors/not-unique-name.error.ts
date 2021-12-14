export class NotUniqueNameError extends Error {
  constructor(name: string) {
    super(`Name "${name}" is not unique in the template.`);
  }
}
