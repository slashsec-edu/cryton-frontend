import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'crytonDatetime'
})
export class CrytonDatetimePipe implements PipeTransform {
  transform(input: string | Date): string {
    if (!input) {
      return 'None';
    }

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(input, 'dd. MM. YYYY - HH:mm:ss');
  }
}
