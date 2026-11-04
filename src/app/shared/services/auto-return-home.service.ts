import {
  DOCUMENT,
  DestroyRef,
  ErrorHandler,
  RendererFactory2,
  Service,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { EMPTY, Subject, filter, switchMap, timer } from 'rxjs';
import { ScreenMode } from '../constants/screen-mode.constants';
import { ScreenModeRouteData } from '../types/screen-mode.types';

/** How long the app waits before returning to Home, per situation. */
const RETURN_HOME_DELAYS = {
  browsingIdleMs: 5 * 60_000, // Trainers / Workouts screens
  videoPausedMs: 5 * 60_000, // video paused
  videoEndedMs: 20_000, // video finished
} as const;

const ACTIVITY_EVENTS = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'] as const;

/**
 * Returns the kiosk to Home when nobody is using it.
 * Each route says which rules apply through `data.screenMode` (see `ScreenMode`).
 */
@Service()
export class AutoReturnHomeService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandler);
  // Services can't inject Renderer2 directly; the factory gives a renderer not tied to a component.
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private screenMode: ScreenMode = ScreenMode.HOME;
  /** Each value restarts the countdown to Home: a delay in ms, or `null` to stop it. */
  private readonly countdown = new Subject<number | null>();

  /** Starts following navigation and user activity. Call once at app start. */
  start(): void {
    this.countdown
      .pipe(
        switchMap((delayMs) => (delayMs === null ? EMPTY : timer(delayMs))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.returnHome();
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.setScreenMode(this.currentRouteScreenMode());
      });

    const onActivity = () => {
      if (this.screenMode === ScreenMode.BROWSING) {
        this.startTimer(RETURN_HOME_DELAYS.browsingIdleMs);
      }
    };
    // Capture phase so `scroll` from the inner scroll container (which doesn't bubble) is seen.
    const removeListeners = ACTIVITY_EVENTS.map((type) =>
      this.renderer.listen(this.document, type, onActivity, { capture: true, passive: true }),
    );

    this.destroyRef.onDestroy(() => {
      for (const removeListener of removeListeners) {
        removeListener();
      }
    });
  }

  /** The video started or resumed: nothing returns Home while it plays. */
  onVideoPlaying(): void {
    if (this.screenMode === ScreenMode.PLAYER) {
      this.clearTimer();
    }
  }

  /** The video was paused: return Home if it stays paused. */
  onVideoPaused(): void {
    if (this.screenMode === ScreenMode.PLAYER) {
      this.startTimer(RETURN_HOME_DELAYS.videoPausedMs);
    }
  }

  /** The video finished: return Home shortly after. */
  onVideoEnded(): void {
    if (this.screenMode === ScreenMode.PLAYER) {
      this.startTimer(RETURN_HOME_DELAYS.videoEndedMs);
    }
  }

  /** Navigate to Home and clear all timers. The player is destroyed by the navigation. */
  private returnHome(): void {
    this.clearTimer();
    void this.router.navigateByUrl('/');
  }

  /** Reads `data.screenMode` from the deepest active route. */
  private currentRouteScreenMode(): ScreenMode {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const data = route.data as Partial<ScreenModeRouteData>;
    if (data.screenMode === undefined) {
      // Every route must set `data.screenMode` (a test in app.routes.spec.ts checks this).
      // Report it loudly instead of quietly running without timers.
      this.errorHandler.handleError(
        new Error(
          `Route "${route.routeConfig?.path}" has no data.screenMode: auto-return is off on this screen.`,
        ),
      );
      return ScreenMode.HOME;
    }
    return data.screenMode;
  }

  private setScreenMode(screenMode: ScreenMode): void {
    this.screenMode = screenMode;
    if (screenMode === ScreenMode.BROWSING) {
      this.startTimer(RETURN_HOME_DELAYS.browsingIdleMs);
    } else {
      this.clearTimer();
    }
  }

  /** Starts the countdown to Home, replacing any running one. */
  private startTimer(delayMs: number): void {
    this.countdown.next(delayMs);
  }

  private clearTimer(): void {
    this.countdown.next(null);
  }
}
