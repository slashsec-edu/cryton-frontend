import { Pipe, PipeTransform } from '@angular/core';
import { stringify } from 'yaml';

@Pipe({
  name: 'yaml'
})
export class YamlPipe implements PipeTransform {
  transform(value: string | Record<string, unknown>): string {
    try {
      const yaml = stringify(value);
      return yaml.trim();
    } catch (e) {
      throw new Error('Conversion of json to yaml failed.');
    }
  }
}
