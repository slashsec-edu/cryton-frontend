import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {
  sidenavResize$ = new Subject<void>();

  constructor() {}
}
