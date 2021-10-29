import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number): string {
    const gb = bytes / Math.pow(1024, 3);
    const mb = bytes / Math.pow(1024, 2);
    const kb = bytes / 1024;

    if (gb >= 1) {
      return gb.toFixed(2).toString() + ' GB';
    } else if (mb >= 1) {
      return mb.toFixed(2).toString() + ' MB';
    } else {
      return kb.toFixed(2).toString() + ' KB';
    }
  }
}
