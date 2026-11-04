import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WorkoutLibraryService } from '../../shared/services/workout-library.service';
import { YoutubeIframeApiService } from './video-player/youtube-iframe-api.service';
import { WorkoutComponent } from './workout.component';

describe('WorkoutComponent: player settings', () => {
  /** The settings that reach YouTube, read from the video's embed URL. */
  let embedSettings: URLSearchParams;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        // Nothing loads from the internet; the embed URL is all these tests need.
        { provide: YoutubeIframeApiService, useValue: { load: () => new Promise(() => {}) } },
      ],
    });
    // Real content, so the test works whatever is in workouts.json.
    const category = TestBed.inject(WorkoutLibraryService).categories[0];
    const trainer = category.trainers[0];
    const fixture = TestBed.createComponent(WorkoutComponent);
    fixture.componentRef.setInput('category', category);
    fixture.componentRef.setInput('trainer', trainer);
    fixture.componentRef.setInput('workout', trainer.workouts[0]);
    fixture.detectChanges();

    const iframe = (fixture.nativeElement as HTMLElement).querySelector('iframe')!;
    embedSettings = new URL(iframe.getAttribute('src')!).searchParams;
  });

  it('VP-1: starts automatically and skips the first second', () => {
    expect(embedSettings.get('autoplay')).toBe('1');
    expect(embedSettings.get('start')).toBe('1');
  });

  it('VP-2: no fullscreen button, so users cannot escape the kiosk view', () => {
    expect(embedSettings.get('fs')).toBe('0');
  });

  it('VP-2: no annotations, related videos only from the same channel', () => {
    expect(embedSettings.get('iv_load_policy')).toBe('3');
    expect(embedSettings.get('rel')).toBe('0');
  });

  it("uses our own controls, with YouTube's hidden", () => {
    expect(embedSettings.get('controls')).toBe('0');
  });
});
