import {
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  ErrorHandler,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { EMPTY, catchError, from } from 'rxjs';
import { YoutubePlayerState } from '../youtube-player-state.constants';
import { VideoControlsComponent } from './video-controls/video-controls.component';
import { YoutubeIframeApiService } from './youtube-iframe-api.service';

/** How far the rewind and fast forward buttons jump. */
const SEEK_STEP_SECONDS = 10;

/**
 * Plays a YouTube video without letting users leave the app through it.
 *
 * The video runs in a sandboxed iframe without `allow-popups` and `allow-top-navigation`, so the
 * YouTube logo, Share, channel and title links inside it can't open anything. The iframe is
 * created here (not by the YouTube API) because the sandbox must be set before it loads; the
 * YouTube API is then attached to it to control the video and receive its state changes.
 */
@Component({
  selector: 'app-video-player',
  imports: [VideoControlsComponent],
  template: `
    <iframe
      #iframe
      [src]="embedUrl()"
      sandbox="allow-scripts allow-same-origin"
      allow="autoplay; encrypted-media"
      referrerpolicy="strict-origin-when-cross-origin"
    ></iframe>

    @if (customControls()) {
      <app-video-controls
        class="controls-overlay"
        [playing]="playing()"
        (togglePlay)="togglePlay()"
        (rewind)="rewind()"
        (fastForward)="fastForward()"
      />
    }
  `,
  styles: `
    /* The parent sets the size of this element; the video fills it. */
    :host {
      display: block;
      position: relative;
    }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
    /* Our controls cover the whole video. */
    .controls-overlay {
      position: absolute;
      inset: 0;
    }
  `,
})
export class VideoPlayerComponent {
  readonly videoId = input.required<string>();
  /** Player parameters, as in the YouTube IFrame API `playerVars`. */
  readonly playerVars = input<YT.PlayerVars>({});
  /** true: our own controls over the video, YouTube's controls hidden. */
  readonly customControls = input(false);
  readonly stateChange = output<YoutubePlayerState>();

  /** true while playing or buffering, so the button shows "pause" during short loading pauses. */
  protected readonly playing = signal(false);

  private readonly iframe = viewChild.required<ElementRef<HTMLIFrameElement>>('iframe');
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly youtubeIframeApi = inject(YoutubeIframeApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorHandler = inject(ErrorHandler);

  /** Set once YouTube reports the player ready: its methods can't be called before that. */
  private player: YT.Player | undefined;

  protected readonly embedUrl = computed(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(this.playerVars())) {
      params.set(key, String(value));
    }
    if (this.customControls()) {
      params.set('controls', '0');
    }
    params.set('enablejsapi', '1');
    params.set('origin', this.document.location.origin);
    const url = `https://www.youtube.com/embed/${encodeURIComponent(this.videoId())}?${params}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor() {
    // Once the iframe is rendered and YouTube's API has loaded, connect the player to the iframe.
    // takeUntilDestroyed: if the user leaves before the API loads, nothing is connected.
    // If the API can't load, report it and stay on the screen (T-2: no automatic fallback).
    afterNextRender(() => {
      from(this.youtubeIframeApi.load())
        .pipe(
          catchError((error: unknown) => {
            this.errorHandler.handleError(error);
            return EMPTY;
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((youtube) => {
          this.connectPlayer(youtube);
        });
    });
  }

  protected togglePlay(): void {
    if (this.playing()) {
      this.player?.pauseVideo();
    } else {
      this.player?.playVideo();
    }
  }

  protected rewind(): void {
    this.seekBy(-SEEK_STEP_SECONDS);
  }

  protected fastForward(): void {
    this.seekBy(SEEK_STEP_SECONDS);
  }

  /** Attaches the YouTube API to the iframe, to control the video and receive its state changes. */
  private connectPlayer(youtube: typeof YT): void {
    const player = new youtube.Player(this.iframe().nativeElement, {
      events: {
        onReady: () => {
          this.player = player;
        },
        onStateChange: (event) => {
          this.playing.set(
            event.data === YoutubePlayerState.PLAYING ||
              event.data === YoutubePlayerState.BUFFERING,
          );
          // YouTube types the state as its own `YT.PlayerState` enum; the values are the same.
          this.stateChange.emit(event.data as YoutubePlayerState);
        },
      },
    });
    // Destroy it with the component, even if it never became ready.
    this.destroyRef.onDestroy(() => {
      player.destroy();
    });
  }

  private seekBy(seconds: number): void {
    if (!this.player) {
      return;
    }
    const target = Math.max(0, this.player.getCurrentTime() + seconds);
    // YouTube reports a duration of 0 until the video's details have loaded: no end limit then.
    const duration = this.player.getDuration();
    const clampedTarget = duration > 0 ? Math.min(target, duration) : target;
    this.player.seekTo(clampedTarget, true);
  }
}
