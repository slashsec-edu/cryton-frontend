import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, first, map, mergeMapTo, takeUntil, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const CHECKING_INTERVAL = 60000;

@Injectable({
  providedIn: 'root'
})
export class BackendStatusService implements OnDestroy {
  isLive$: Observable<boolean>;

  private _isLive$ = new BehaviorSubject<boolean>(false);
  private _backendUrl = `http://${environment.crytonRESTApiHost}:${environment.crytonRESTApiPort}`;
  private _interval$ = interval(CHECKING_INTERVAL);
  private _destroy$ = new Subject<void>();

  constructor(private _http: HttpClient) {
    this.isLive$ = this._isLive$.asObservable();
    this._keepCheckningBackendStatus();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  checkBackendStatus(): Observable<boolean> {
    return this._http.get(this._backendUrl, { observe: 'response' }).pipe(
      first(),
      map(res => res.ok),
      tap(isLive => this._isLive$.next(isLive)),
      catchError(() => {
        this._isLive$.next(false);
        return of(false);
      })
    );
  }

  /**
   * Keeps checking every 5 seconds if the backend is live and sets the isLive$ accordingly.
   */
  private _keepCheckningBackendStatus(): void {
    merge(
      this.checkBackendStatus(),
      this._interval$.pipe(mergeMapTo(this.checkBackendStatus()) as OperatorFunction<number, boolean>)
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }
}
