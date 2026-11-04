import { Component, inject, input } from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';
import { AutoReturnHomeService } from '../../shared/services/auto-return-home.service';
import { PageShellComponent } from '../../shared/page-shell/page-shell.component';
import { Category, Trainer, Workout } from '../../shared/types/workout-library.types';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { YoutubePlayerState } from './youtube-player-state.constants';

const PLAYER_VARS = {
  autoplay: 1,
  start: 1, // skip the first second
  fs: 0, // no fullscreen button: it would escape the kiosk UI
  rel: 0, // related videos only from the same channel
  iv_load_policy: 3, // hide annotations
  playsinline: 1,
} as const satisfies YT.PlayerVars;

/**
 * true: our own `VideoPlayerComponent`. Links inside the video (YouTube logo, Share…) can't open
 * anything, and our custom controls are available.
 * false: Angular's standard `<youtube-player>` from `@angular/youtube-player`.
 *
 * We deliberately keep the standard player and the `@angular/youtube-player` dependency as a
 * fallback: our player relies on how YouTube's embed and IFrame API behave inside a sandboxed
 * iframe, and if YouTube changes that, switching this flag restores a working player right away.
 * The fallback has YouTube's own controls only (`USE_CUSTOM_CONTROLS` doesn't apply) and doesn't
 * block the links inside the video. Do not remove it without agreeing that first.
 */
const USE_SANDBOXED_PLAYER = true;

/**
 * true: our own play/pause, rewind and fast forward buttons over the video. They cover the video,
 * so YouTube's right-click menu can't open. Works with the sandboxed player only.
 * false: YouTube's own controls.
 */
const USE_CUSTOM_CONTROLS = true;

@Component({
  selector: 'app-workout',
  imports: [PageShellComponent, YouTubePlayer, VideoPlayerComponent],
  template: `
    <app-page-shell [backLink]="['/', category().id, trainer().id]" [contentBehindHeader]="true">
      <div class="stage">
        @if (sandboxed) {
          <app-video-player
            class="video"
            [videoId]="workout().youtubeVideoId"
            [playerVars]="playerVars"
            [customControls]="customControls"
            (stateChange)="onPlayerStateChange($event)"
          />
        } @else {
          <youtube-player
            class="video"
            [videoId]="workout().youtubeVideoId"
            [playerVars]="playerVars"
            [disablePlaceholder]="true"
            (stateChange)="onFallbackPlayerStateChange($event)"
          />
        }
      </div>
    </app-page-shell>
  `,
  styles: `
    /* Fills the shell's content area (the whole screen, see contentBehindHeader): video centred. */
    .stage {
      height: 100%;
      display: grid;
      place-items: center;
    }
    /*
     * Size of the video: the largest 16:9 box that keeps 160px side gaps (clear of the back arrow)
     * and at least 40px top/bottom gaps: 1600×900 on a 1920×1080 screen.
     * This page decides the box; the player fills it.
     */
    .video {
      display: block;
      width: min(100vw - 320 * var(--u), (100vh - 80 * var(--u)) * 16 / 9);
      aspect-ratio: 16 / 9;
    }
    /* Fallback player only: <youtube-player> sizes its iframe from inputs, so stretch it here. */
    youtube-player ::ng-deep iframe {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class WorkoutComponent {
  private readonly autoReturn = inject(AutoReturnHomeService);
  /** From the route resolvers. */
  readonly category = input.required<Category>();
  readonly trainer = input.required<Trainer>();
  readonly workout = input.required<Workout>();
  protected readonly playerVars = PLAYER_VARS;
  protected readonly sandboxed = USE_SANDBOXED_PLAYER;
  protected readonly customControls = USE_CUSTOM_CONTROLS;

  /** The video's state drives the auto-return timers (paused, ended…). */
  protected onPlayerStateChange(state: YoutubePlayerState): void {
    switch (state) {
      case YoutubePlayerState.PLAYING:
        this.autoReturn.onVideoPlaying();
        break;
      case YoutubePlayerState.PAUSED:
        this.autoReturn.onVideoPaused();
        break;
      case YoutubePlayerState.ENDED:
        this.autoReturn.onVideoEnded();
        break;
      // UNSTARTED, BUFFERING, CUED: no change for auto-return (the current timer keeps running).
    }
  }

  /** Same, for the fallback `<youtube-player>`, which emits YouTube's own event object. */
  protected onFallbackPlayerStateChange(event: YT.OnStateChangeEvent): void {
    // YouTube types the state as its own `YT.PlayerState` enum; the values are the same.
    this.onPlayerStateChange(event.data as YoutubePlayerState);
  }
}
