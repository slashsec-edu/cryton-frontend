export class UndefinedTemplatePropertyError extends Error {
  constructor(parameterName: string) {
    super(`Missing template property: ${parameterName}`);
  }
}
