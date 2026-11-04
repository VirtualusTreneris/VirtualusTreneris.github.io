import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { YoutubeIframeApiService } from './features/workout/video-player/youtube-iframe-api.service';
import { WorkoutLibraryService } from './shared/services/workout-library.service';
import { ScreenMode } from './shared/constants/screen-mode.constants';

describe('route config', () => {
  it('every screen route sets data.screenMode, so auto-return knows which timers to run', () => {
    const validModes: ScreenMode[] = Object.values(ScreenMode);
    const screenRoutes = routes.filter((route) => route.redirectTo === undefined);
    expect(screenRoutes.length).toBeGreaterThan(0);
    for (const route of screenRoutes) {
      expect(validModes, `route "${route.path}"`).toContain(route.data?.['screenMode']);
    }
  });
});

describe('routes', () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        // Opening the player must not add YouTube's real script; it never finishes loading here.
        { provide: YoutubeIframeApiService, useValue: { load: () => new Promise(() => {}) } },
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  // Real ids from workouts.json, so these tests keep working whatever the content is.
  const firstCategory = () => TestBed.inject(WorkoutLibraryService).categories[0];
  const firstTrainer = () => firstCategory().trainers[0];
  const page = () => harness.routeNativeElement as HTMLElement;

  it('FR-7: redirects unknown ids to Home', async () => {
    const category = firstCategory().id;
    const trainer = firstTrainer().id;
    for (const url of [
      '/no-such-category',
      `/${category}/no-such-trainer`,
      `/${category}/${trainer}/no-such-workout`,
      '/a/b/c/d',
    ]) {
      await harness.navigateByUrl(url);
      expect(router.url, url).toBe('/');
    }
  });

  it('FR-3: shows the workouts title and one card per workout with its duration', async () => {
    const category = firstCategory();
    const trainer = firstTrainer();
    const workout = trainer.workouts[0];
    await harness.navigateByUrl(`/${category.id}/${trainer.id}`);
    expect(page().querySelector('h1')?.textContent).toBe(
      `${category.shortTitle} su ${trainer.nameInstrumental}`,
    );
    expect(page().querySelectorAll('.card').length).toBe(trainer.workouts.length);
    expect(page().querySelector('.card-detail')?.textContent).toBe(
      `${workout.durationMinutes} min`,
    );
  });

  it('FR-6: hides the back arrow on Home only', async () => {
    await harness.navigateByUrl('/');
    expect(page().querySelector('.back')).toBeNull();
    await harness.navigateByUrl(`/${firstCategory().id}`);
    expect(page().querySelector('.back')).not.toBeNull();
  });

  it('FR-6: the back arrow goes up exactly one level, from every screen', async () => {
    const category = firstCategory().id;
    const trainer = firstTrainer().id;
    const workout = firstTrainer().workouts[0].id;
    const backFrom = [
      [`/${category}/${trainer}/${workout}`, `/${category}/${trainer}`], // player → workouts
      [`/${category}/${trainer}`, `/${category}`], // workouts → trainers
      [`/${category}`, '/'], // trainers → home
    ];
    for (const [from, expectedParent] of backFrom) {
      await harness.navigateByUrl(from);
      page().querySelector<HTMLButtonElement>('.back')!.click();
      await harness.fixture.whenStable();
      expect(router.url, `back from ${from}`).toBe(expectedParent);
    }
  });

  it('FR-5: tapping a category or card opens the next screen, on every screen', async () => {
    const category = firstCategory().id;
    const trainer = firstTrainer().id;
    const workout = firstTrainer().workouts[0].id;
    const tapFirst = [
      ['/', '.category-button', `/${category}`], // home → trainers
      [`/${category}`, '.card', `/${category}/${trainer}`], // trainers → workouts
      [`/${category}/${trainer}`, '.card', `/${category}/${trainer}/${workout}`], // workouts → player
    ];
    for (const [from, selector, expectedNext] of tapFirst) {
      await harness.navigateByUrl(from);
      page().querySelector<HTMLButtonElement>(selector)!.click();
      await harness.fixture.whenStable();
      expect(router.url, `tap on ${from}`).toBe(expectedNext);
    }
  });
});
