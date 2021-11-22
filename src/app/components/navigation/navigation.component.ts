import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { routes, Route, metaRoutes } from './routes';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { MatSidenav } from '@angular/material/sidenav';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ThemeService } from 'src/app/services/theme.service';
import { ResizeService } from 'src/app/services/resize.service';
import { BackendStatusService } from 'src/app/services/backend-status.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  animations: [
    trigger('toggleSublinks', [
      state('closed', style({ transform: 'scaleY(0)', height: '0' })),
      state('open', style({ transform: 'scaleY(1)', height: '*' })),
      transition('open <=> closed', animate('250ms ease'))
    ]),
    renderComponentTrigger
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild(ComponentInputDirective, { static: true }) alertHost!: ComponentInputDirective;

  routes: Route[] = routes;
  metaRoutes: Route[] = metaRoutes;

  openRoute: Route;
  selectedRoute: Route;

  isSidebarClosed = false;
  isAccountClosed = true;
  shouldShowOver = false;
  isBackendLive = false;

  private _destroy$ = new Subject<void>();

  constructor(
    public themeService: ThemeService,
    private _backendStatus: BackendStatusService,
    private _breakpointObserver: BreakpointObserver,
    private _resizeService: ResizeService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initSidebarBreakpoint();

    const isClosed = JSON.parse(localStorage.getItem('isSidebarClosed')) as boolean;

    if (isClosed != null) {
      this.isSidebarClosed = isClosed;
    }

    this._backendStatus.isLive$.pipe(takeUntil(this._destroy$)).subscribe(isLive => {
      this.isBackendLive = isLive;
      this._cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Initializes breakpoint observer to switch sidenav mode based on viewport max width.
   */
  initSidebarBreakpoint(): void {
    this._breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntil(this._destroy$))
      .subscribe((breakpointState: BreakpointState) => {
        if (breakpointState.matches) {
          this.shouldShowOver = true;
          this.isSidebarClosed = false;
          if (this.sidenav) {
            this.sidenav.close().then(() => {
              this._resizeService.sidenavResize$.next();
            });
          }
        } else {
          this.shouldShowOver = false;
          if (this.sidenav) {
            this.sidenav.open().then(() => {
              this._resizeService.sidenavResize$.next();
            });
          }
        }
      });
  }

  /**
   * Toggles visibility or display of sidenav based on current sidenav mode.
   */
  toggleSidenav(): void {
    this._resizeService.sidenavResize$.next();
    if (this.shouldShowOver) {
      this.sidenav.toggle();
    } else {
      this.isSidebarClosed = !this.isSidebarClosed;
      localStorage.setItem('isSidebarClosed', JSON.stringify(this.isSidebarClosed));
    }
  }

  /**
   * Toggles visibility of route sublinks.
   *
   * @param route Route to be toggled.
   */
  toggleRoute(route: Route): void {
    if (this.openRoute === route) {
      this.openRoute = null;
    } else {
      this.openRoute = route;
    }
  }

  toggleDarkMode(e: MatSlideToggleChange): void {
    if (e.checked) {
      this.themeService.changeTheme('dark-theme', true);
    } else {
      this.themeService.changeTheme('light-theme', false);
    }
  }

  checkBackendStatus(): void {
    this._backendStatus.checkBackendStatus().pipe(first()).subscribe();
  }
}
