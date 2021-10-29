import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'crytonDatetime'
})
export class CrytonDatetimePipe implements PipeTransform {
  transform(input: string): string {
    if (!input) {
      return 'None';
    }

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(input, 'dd. MM. YYYY - HH:mm:ss');
  }
}
