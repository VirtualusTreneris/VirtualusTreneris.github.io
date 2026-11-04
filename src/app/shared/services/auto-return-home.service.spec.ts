import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, Event as RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { ScreenMode } from '../constants/screen-mode.constants';
import { AutoReturnHomeService } from './auto-return-home.service';

// Delays from the functional requirements (not from the code), so a wrong delay in the code fails.
const FIVE_MINUTES_MS = 5 * 60_000;
const TWENTY_SECONDS_MS = 20_000;

describe('AutoReturnHomeService: automatic return to Home', () => {
  let events: Subject<RouterEvent>;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let autoReturn: AutoReturnHomeService;
  let navId = 0;
  let currentScreenMode: ScreenMode = ScreenMode.HOME;

  // In the app, each route sets `data.screenMode`; here the test URLs map to the same modes.
  const screenModeByUrl: Record<string, ScreenMode> = {
    '/': ScreenMode.HOME,
    '/funkcine': ScreenMode.BROWSING,
    '/funkcine/mindaugas': ScreenMode.BROWSING,
    '/funkcine/mindaugas/funkcine-1': ScreenMode.PLAYER,
  };
  const go = (url: string) => {
    currentScreenMode = screenModeByUrl[url];
    events.next(new NavigationEnd(++navId, url, url));
  };
  const advance = (ms: number) => vi.advanceTimersByTime(ms);
  const wentHome = () => expect(navigateByUrl).toHaveBeenCalledWith('/');
  const stayed = () => expect(navigateByUrl).not.toHaveBeenCalled();
  const fire = (type: string, target: EventTarget = document) =>
    target.dispatchEvent(new Event(type, { bubbles: false }));

  beforeEach(() => {
    vi.useFakeTimers();
    events = new Subject<RouterEvent>();
    navigateByUrl = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            events,
            navigateByUrl,
            routerState: {
              get snapshot() {
                return { root: { firstChild: null, data: { screenMode: currentScreenMode } } };
              },
            },
          },
        },
      ],
    });
    autoReturn = TestBed.inject(AutoReturnHomeService);
    autoReturn.start();
  });

  afterEach(() => {
    TestBed.resetTestingModule(); // destroys the service, removing listeners and timers
    vi.useRealTimers();
  });

  describe('Home', () => {
    it('never returns Home on its own, and runs no timer', () => {
      go('/');
      fire('pointerdown');
      advance(24 * 60 * 60_000);
      stayed();
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe.each([
    ['Trainers', '/funkcine'],
    ['Workouts', '/funkcine/mindaugas'],
  ])('%s list screen', (_name, url) => {
    beforeEach(() => go(url));

    it('returns Home after 5 min without activity', () => {
      advance(FIVE_MINUTES_MS - 1);
      stayed();
      advance(1);
      wentHome();
    });

    it.each(['pointerdown', 'touchstart', 'wheel', 'keydown'])(
      'restarts the 5 min on %s',
      (type) => {
        advance(FIVE_MINUTES_MS - 1000);
        fire(type);
        advance(FIVE_MINUTES_MS - 1);
        stayed();
        advance(1);
        wentHome();
      },
    );

    it('restarts the 5 min on scroll of the inner scroll container', () => {
      const scroller = document.createElement('main');
      document.body.appendChild(scroller);
      onTestFinished(() => scroller.remove());
      advance(FIVE_MINUTES_MS - 1000);
      fire('scroll', scroller); // scroll does not bubble; caught in capture phase
      advance(FIVE_MINUTES_MS - 1);
      stayed();
      advance(1);
      wentHome();
    });

    it('T-1: keeps exactly one timer, never stacking them', () => {
      for (let i = 0; i < 10; i++) {
        fire('pointerdown');
      }
      expect(vi.getTimerCount()).toBe(1);
    });
  });

  it('moving between list screens restarts the 5 min', () => {
    go('/funkcine');
    advance(FIVE_MINUTES_MS - 1000);
    go('/funkcine/mindaugas');
    advance(FIVE_MINUTES_MS - 1);
    stayed();
    advance(1);
    wentHome();
  });

  describe('Player', () => {
    const playerUrl = '/funkcine/mindaugas/funkcine-1';

    it('cancels the list timer on entering; no timer while loading', () => {
      go('/funkcine/mindaugas');
      go(playerUrl);
      expect(vi.getTimerCount()).toBe(0);
      advance(60 * 60_000);
      stayed();
    });

    it('ignores taps: they do not start a list timer', () => {
      go(playerUrl);
      fire('pointerdown');
      expect(vi.getTimerCount()).toBe(0);
    });

    it('PLAYING: nothing auto-returns, even after 5+ minutes', () => {
      go(playerUrl);
      autoReturn.onVideoPlaying();
      advance(60 * 60_000);
      stayed();
    });

    it('PAUSED: returns Home after 5 min', () => {
      go(playerUrl);
      autoReturn.onVideoPlaying();
      autoReturn.onVideoPaused();
      advance(FIVE_MINUTES_MS - 1);
      stayed();
      advance(1);
      wentHome();
    });

    it('PAUSED then PLAYING cancels the pause timer', () => {
      go(playerUrl);
      autoReturn.onVideoPaused();
      advance(FIVE_MINUTES_MS - 1000);
      autoReturn.onVideoPlaying();
      advance(60 * 60_000);
      stayed();
    });

    it('ENDED: returns Home after 20 s', () => {
      go(playerUrl);
      autoReturn.onVideoPlaying();
      autoReturn.onVideoEnded();
      advance(TWENTY_SECONDS_MS - 1);
      stayed();
      advance(1);
      wentHome();
    });

    it('back from the player cancels player timers; Workouts starts its own 5 min', () => {
      go(playerUrl);
      autoReturn.onVideoEnded();
      go('/funkcine/mindaugas');
      advance(TWENTY_SECONDS_MS);
      stayed(); // the 20 s end timer did not fire
      advance(FIVE_MINUTES_MS - TWENTY_SECONDS_MS - 1);
      stayed();
      advance(1);
      wentHome();
    });

    it('T-1: late player events after leaving are ignored', () => {
      go(playerUrl);
      go('/');
      autoReturn.onVideoEnded();
      advance(60 * 60_000);
      stayed();
    });
  });
});
