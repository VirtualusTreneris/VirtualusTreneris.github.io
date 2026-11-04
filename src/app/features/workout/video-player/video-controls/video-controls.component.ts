import { Component, computed, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, concat, map, of, switchMap, timer } from 'rxjs';

/** How long the buttons stay visible after the last tap while the video plays. */
const HIDE_AFTER_MS = 4000;

/**
 * Layer over the video that replaces YouTube's own controls.
 * It catches every tap, so nothing reaches the YouTube iframe (no YouTube right-click menu).
 * Tapping the video plays/pauses it. The buttons show while the video is paused, and for a few
 * seconds after the last tap while it plays.
 */
@Component({
  selector: 'app-video-controls',
  template: `
    <div class="tap-area" (click)="onTapArea()"></div>

    <div class="controls" [class.hidden]="hidden()">
      <button type="button" class="button button-seek button-rewind" (click)="onRewind()">
        <svg viewBox="0 0 48 48">
          <path class="arrow-arc" d="M24 8a16 16 0 1 1-16 16" />
          <path class="arrow-head" d="M17 8l8-5.5v11z" />
          <text x="24" y="29.5">10</text>
        </svg>
      </button>

      <button type="button" class="button button-toggle-play" (click)="onTogglePlay()">
        <svg viewBox="0 0 48 48">
          @if (playing()) {
            <path d="M15 11h6v26h-6zM27 11h6v26h-6z" />
          } @else {
            <path d="M17 10.5v27l21-13.5z" />
          }
        </svg>
      </button>

      <button
        type="button"
        class="button button-seek button-fast-forward"
        (click)="onFastForward()"
      >
        <svg viewBox="0 0 48 48">
          <g transform="translate(48 0) scale(-1 1)">
            <path class="arrow-arc" d="M24 8a16 16 0 1 1-16 16" />
            <path class="arrow-head" d="M17 8l8-5.5v11z" />
          </g>
          <text x="24" y="29.5">10</text>
        </svg>
      </button>
    </div>
  `,
  styles: `
    /*
     * The parent positions this element over the video; it's a layer of the same size.
     * position: relative, so the tap area and the bar below are placed inside it.
     */
    :host {
      display: block;
      position: relative;
    }
    .tap-area {
      position: absolute;
      inset: 0;
      touch-action: manipulation;
    }

    /*
     * Bottom bar: dark gradient behind the buttons so they read on any video.
     * Only the buttons catch taps; a tap anywhere else on the bar reaches the tap area (VC-1).
     */
    .controls {
      pointer-events: none;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: calc(80 * var(--u)) 0 calc(36 * var(--u));
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
      display: flex;
      justify-content: center;
      align-items: center;
      gap: calc(72 * var(--u));
      transition:
        opacity 250ms ease-out,
        transform 250ms ease-out;
    }
    .controls.hidden {
      opacity: 0;
      transform: translateY(calc(16 * var(--u)));
    }

    .button {
      pointer-events: auto;
      padding: 0;
      border: 0;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }

    /* Hidden buttons don't catch taps either. */
    .controls.hidden .button {
      pointer-events: none;
    }

    /* Rewind / fast forward: white icon only, no background. */
    .button-seek {
      width: max(64px, calc(88 * var(--u)));
      height: max(64px, calc(88 * var(--u)));
      background: none;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
    }
    .button-seek svg {
      width: 80%;
      height: 80%;
    }
    .arrow-arc {
      fill: none;
      stroke: #fff;
      stroke-width: 3.5;
      stroke-linecap: round;
    }
    .arrow-head {
      fill: #fff;
    }
    text {
      fill: #fff;
      font-size: 13px;
      font-weight: 700;
      text-anchor: middle;
    }

    /* Play / pause: solid white circle, dark icon. */
    .button-toggle-play {
      width: max(80px, calc(112 * var(--u)));
      height: max(80px, calc(112 * var(--u)));
      background: #fff;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    }
    .button-toggle-play svg {
      width: 50%;
      height: 50%;
      fill: #111;
    }
  `,
})
export class VideoControlsComponent {
  readonly playing = input.required<boolean>();
  readonly togglePlay = output<void>();
  readonly rewind = output<void>();
  readonly fastForward = output<void>();

  /** Every tap or button press. */
  private readonly controlsUsed = new Subject<void>();
  /** true right after a use, false again HIDE_AFTER_MS after the last one. */
  private readonly recentlyUsed = toSignal(
    this.controlsUsed.pipe(
      switchMap(() => concat(of(true), timer(HIDE_AFTER_MS).pipe(map(() => false)))),
    ),
    { initialValue: false },
  );
  /** Hidden while the video plays, unless the controls were just used. */
  protected readonly hidden = computed(() => this.playing() && !this.recentlyUsed());

  protected onTapArea(): void {
    this.togglePlay.emit();
    this.showControlsTemporarily();
  }

  protected onRewind(): void {
    this.rewind.emit();
    this.showControlsTemporarily();
  }

  protected onTogglePlay(): void {
    this.togglePlay.emit();
    this.showControlsTemporarily();
  }

  protected onFastForward(): void {
    this.fastForward.emit();
    this.showControlsTemporarily();
  }

  private showControlsTemporarily(): void {
    this.controlsUsed.next();
  }
}
