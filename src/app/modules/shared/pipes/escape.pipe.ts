import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'escape'
})
export class EscapePipe implements PipeTransform {
  private _entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };

  transform(value: string): unknown {
    return String(value).replace(/[&<>"'\/]/g, s => this._entityMap[s]);
  }
}
