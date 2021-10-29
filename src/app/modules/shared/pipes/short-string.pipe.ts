import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortString'
})
export class ShortStringPipe implements PipeTransform {
  transform(value: unknown, length: number): string {
    if (!value) {
      return null;
    }

    const stringValue = value.toString();

    if (stringValue.length <= length) {
      return stringValue;
    }
    const substring = stringValue.substring(0, length);
    return substring + '...';
  }
}
