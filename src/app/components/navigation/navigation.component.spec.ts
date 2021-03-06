import { BreakpointObserver, BreakpointState, LayoutModule } from '@angular/cdk/layout';
import { HarnessLoader } from '@angular/cdk/testing/component-harness';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatNavListHarness, MatNavListItemHarness } from '@angular/material/list/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenavHarness } from '@angular/material/sidenav/testing';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { BackendStatusService } from 'src/app/services/backend-status.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let loader: HarnessLoader;

  let sidenavHarness: MatSidenavHarness;
  let navListHarness: MatNavListHarness;

  // Defines breakpoint match for max-size: 768px
  const breakpointMatch$ = new BehaviorSubject<boolean>(false);

  const fakeObserve = (): Observable<BreakpointState> =>
    breakpointMatch$.asObservable().pipe(map(value => ({ matches: value, breakpoints: {} } as BreakpointState)));

  const bpSpy = jasmine.createSpyObj('BreakpointObserver', ['observe']) as Spied<BreakpointObserver>;
  bpSpy.observe.and.callFake(fakeObserve);

  const isLive$ = new BehaviorSubject(true);
  const backendStatusStub = jasmine.createSpyObj('BackendStatusService', [], {
    isLive$: isLive$.asObservable()
  }) as Spied<BackendStatusService>;

  /**
   * Tests if navbar links display text.
   * Text should not be displayed if the sidebar is closed.
   *
   * @param shouldHaveText Defines if links should display text.
   */
  const testText = async (shouldHaveText: boolean) => {
    const links: MatNavListItemHarness[] = await navListHarness.getItems();

    for (const link of links) {
      const linkText = await link.getText();

      if (shouldHaveText) {
        expect(linkText).toBeTruthy();
      } else {
        expect(linkText).toBeFalsy();
      }
    }
  };

  const testBackendStatus = (shouldBeLive: boolean): void => {
    const nativeEl = fixture.nativeElement as HTMLElement;
    const backendStatusContainer = nativeEl.querySelector('.backend-status');
    const dotSpan = backendStatusContainer.querySelector('.dot');
    const statusText = backendStatusContainer.querySelector('small');

    const statusName = shouldBeLive ? 'live' : 'offline';
    expect(dotSpan.classList.contains(statusName)).toBeTrue();
    expect(statusText.textContent).toContain(statusName);
  };

  beforeEach(async () => {
    /**
     * Needs to override change detection strategy to Default
     * otherwise fixture.detectChanges() doesn't work properly.
     */
    TestBed.configureTestingModule({
      imports: [
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
        LayoutModule,
        MatIconModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MatMenuModule,
        MatSlideToggleModule
      ],
      declarations: [NavigationComponent],
      providers: [
        { provide: BreakpointObserver, useValue: bpSpy },
        { provide: BackendStatusService, useValue: backendStatusStub }
      ]
    })
      .overrideComponent(NavigationComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    sidenavHarness = await loader.getHarness(MatSidenavHarness);
    navListHarness = await loader.getHarness(MatNavListHarness);

    // Localstorage might set sidebar to open state.
    component.isSidebarClosed = false;

    // Defines that screen is bigger than 768px. Sidebar stays open.
    breakpointMatch$.next(false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle without closing on menu click when window max-width is > 768px', async () => {
    const menuButtonHarness = await loader.getHarness(MatButtonHarness.with({ text: 'menu' }));

    expect(component.isSidebarClosed).toBeFalse();
    expect(await sidenavHarness.isOpen()).toBeTrue();

    await menuButtonHarness.click();

    expect(await sidenavHarness.isOpen()).toBeTrue();
    expect(component.isSidebarClosed).toBeTrue();
  });

  it('should open/close on menu click when window max-width is <= 768px', async () => {
    breakpointMatch$.next(true);
    const menuButtonHarness = await loader.getHarness(MatButtonHarness.with({ text: 'menu' }));

    expect(await sidenavHarness.isOpen()).toBeFalse();

    await menuButtonHarness.click();

    expect(await sidenavHarness.isOpen()).toBeTrue();
  });

  it('should show route text when open', async () => {
    component.isSidebarClosed = false;
    fixture.detectChanges();

    await testText(true);
  });

  it('should hide route text when closed', async () => {
    component.isSidebarClosed = true;
    fixture.detectChanges();

    await testText(false);
  });

  it('should switch mode from "side" to "over" when viewport max-width reaches 768px', async () => {
    expect(component.shouldShowOver).toBeFalse();
    expect(await sidenavHarness.getMode()).toEqual('side');

    breakpointMatch$.next(true);
    fixture.detectChanges();

    expect(component.shouldShowOver).toBeTrue();
    expect(await sidenavHarness.getMode()).toEqual('over');
  });

  it('should show that backend is live', () => {
    isLive$.next(true);
    fixture.detectChanges();

    testBackendStatus(true);
  });

  it('should show that backend is offline', () => {
    isLive$.next(false);
    fixture.detectChanges();

    testBackendStatus(false);
  });
});
