export class FormUtils {
  static someValueDefined(object: Record<string, string>): boolean {
    return Object.values(object).some(value => value);
  }

  static someValueOtherThan(object: Record<string, string>, value: string | number): boolean {
    return Object.values(object).some(itemValue => itemValue !== value);
  }
}
