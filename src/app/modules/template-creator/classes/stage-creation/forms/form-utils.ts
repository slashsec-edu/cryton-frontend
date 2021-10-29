export class FormUtils {
  static someValueDefined(object: Record<string, string>): boolean {
    return Object.values(object).some(value => value);
  }
}
