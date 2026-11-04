import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { VideoPlayerComponent } from './features/workout/video-player/video-player.component';
import { YoutubeIframeApiService } from './features/workout/video-player/youtube-iframe-api.service';
import { YoutubePlayerState } from './features/workout/youtube-player-state.constants';
import { AutoReturnHomeService } from './shared/services/auto-return-home.service';
import { WorkoutLibraryService } from './shared/services/workout-library.service';

/*
 * Automatic return to Home, end to end: the real routes, the real pages and the real auto-return
 * service. The service's own spec fakes the router; these check that the pieces work together.
 * (A route missing `data.screenMode` is caught by the 'route config' test in app.routes.spec.ts.)
 */
describe('automatic return to Home, with the real routes and pages', () => {
  // Delays from the functional requirements, not from the code.
  const FIVE_MINUTES_MS = 5 * 60_000;
  const TWENTY_SECONDS_MS = 20_000;
  const ONE_HOUR_MS = 60 * 60_000;

  let harness: RouterTestingHarness;
  let router: Router;

  // Real content, so the tests work whatever is in workouts.json.
  const firstCategory = () => TestBed.inject(WorkoutLibraryService).categories[0];
  const firstTrainer = () => firstCategory().trainers[0];
  const firstWorkoutUrl = () =>
    `/${firstCategory().id}/${firstTrainer().id}/${firstTrainer().workouts[0].id}`;

  /**
   * Navigates with fake timers. Angular's router and change detection need timer ticks to finish,
   * so step the fake clock (vi.waitFor does that) until the URL has changed.
   */
  const navigateTo = async (url: string) => {
    const navigation = harness.navigateByUrl(url);
    await vi.waitFor(() => expect(router.url).toBe(url));
    await navigation;
  };
  const advance = (ms: number) => vi.advanceTimersByTimeAsync(ms);
  const expectBackHome = () => vi.waitFor(() => expect(router.url).toBe('/'));

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        // Opening the player must not add YouTube's real script; it never finishes loading here.
        { provide: YoutubeIframeApiService, useValue: { load: () => new Promise(() => {}) } },
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
    TestBed.inject(AutoReturnHomeService).start();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('list screen: returns Home after 5 min', async () => {
    await navigateTo(`/${firstCategory().id}`);
    await advance(FIVE_MINUTES_MS);
    await expectBackHome();
  });

  describe('workout page: the video drives it', () => {
    /**
     * Makes the video player report a state, through its public `stateChange` output.
     * The step before (YouTube → `stateChange`) is tested in video-player.component.spec.ts with a
     * fake YouTube; faking YouTube again here would tie this test to the player's internals.
     */
    const reportVideoState = (state: YoutubePlayerState) => {
      const videoPlayer = harness.routeDebugElement!.query(By.directive(VideoPlayerComponent))
        .componentInstance as VideoPlayerComponent;
      videoPlayer.stateChange.emit(state);
    };
    const expectStillOnWorkout = () => expect(router.url).toBe(firstWorkoutUrl());

    beforeEach(async () => {
      await navigateTo(firstWorkoutUrl());
    });

    it('playing: stays on the workout, even after an hour', async () => {
      reportVideoState(YoutubePlayerState.PLAYING);
      await advance(ONE_HOUR_MS);
      expectStillOnWorkout();
    });

    it('paused: returns Home after 5 min', async () => {
      reportVideoState(YoutubePlayerState.PAUSED);
      await advance(FIVE_MINUTES_MS - 1);
      expectStillOnWorkout();
      await advance(1);
      await expectBackHome();
    });

    it('paused, then playing again: stays on the workout', async () => {
      reportVideoState(YoutubePlayerState.PAUSED);
      await advance(FIVE_MINUTES_MS - 1000);
      reportVideoState(YoutubePlayerState.PLAYING);
      await advance(ONE_HOUR_MS);
      expectStillOnWorkout();
    });

    it('ended: returns Home after 20 s', async () => {
      reportVideoState(YoutubePlayerState.ENDED);
      await advance(TWENTY_SECONDS_MS - 1);
      expectStillOnWorkout();
      await advance(1);
      await expectBackHome();
    });

    it.each([
      ['UNSTARTED', YoutubePlayerState.UNSTARTED],
      ['BUFFERING', YoutubePlayerState.BUFFERING],
      ['CUED', YoutubePlayerState.CUED],
    ])('%s while paused: the 5 min pause countdown keeps running', async (_name, state) => {
      reportVideoState(YoutubePlayerState.PAUSED);
      await advance(1000);
      reportVideoState(state);
      await advance(FIVE_MINUTES_MS - 1001);
      expectStillOnWorkout();
      await advance(1);
      await expectBackHome();
    });

    it.each([
      ['UNSTARTED', YoutubePlayerState.UNSTARTED],
      ['BUFFERING', YoutubePlayerState.BUFFERING],
      ['CUED', YoutubePlayerState.CUED],
    ])('%s alone: starts no countdown, not even the list timer', async (_name, state) => {
      reportVideoState(state);
      await advance(ONE_HOUR_MS);
      expectStillOnWorkout();
    });
  });
});
