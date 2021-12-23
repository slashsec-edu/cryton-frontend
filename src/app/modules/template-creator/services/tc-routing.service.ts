import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface TCRoute {
  stepIndex: number;
  componentName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TcRoutingService {
  route$: Observable<TCRoute>;
  private _route$ = new Subject<TCRoute>();

  constructor() {
    this.route$ = this._route$.asObservable();
  }

  navigateTo(stepIndex: number, componentName?: string): void {
    this._route$.next({ stepIndex, componentName });
  }
}
