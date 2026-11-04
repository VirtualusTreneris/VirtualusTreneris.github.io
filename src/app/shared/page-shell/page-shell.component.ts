import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Fixed header (back arrow + title) over a vertically scrolling content area.
 * With `contentBehindHeader`, the content area fills the whole screen and the header floats on top
 * of it (used by the workout page, so the video is centred on the whole screen).
 */
@Component({
  selector: 'app-page-shell',
  imports: [RouterLink],
  host: {
    '[class.content-behind-header]': 'contentBehindHeader()',
  },
  template: `
    <header>
      @if (backLink()) {
        <button type="button" class="back" [routerLink]="backLink()">
          <svg viewBox="0 0 72 72">
            <path d="M45 14 23 36l22 22" />
          </svg>
        </button>
      }
      @if (heading()) {
        <h1>{{ heading() }}</h1>
      }
    </header>
    <main class="scroll">
      <ng-content />
    </main>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
    }
    header {
      flex: none;
      position: relative;
      height: calc(120 * var(--u));
    }
    /* Header on top of a full-screen content area; only its buttons catch taps. */
    :host(.content-behind-header) header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1;
      pointer-events: none;
    }
    :host(.content-behind-header) .back {
      pointer-events: auto;
    }
    h1 {
      margin: 0;
      padding-top: calc(22 * var(--u));
      text-align: center;
      font-weight: 700;
      font-size: calc(50 * var(--u));
      line-height: calc(59 * var(--u));
      text-transform: uppercase;
    }
    .back {
      position: absolute;
      /* 72px icon at left 63 / top 40, inside a larger tap area */
      left: calc(39 * var(--u));
      top: calc(16 * var(--u));
      width: max(96px, calc(120 * var(--u)));
      height: max(96px, calc(120 * var(--u)));
      padding: 0;
      border: 0;
      background: none;
      display: grid;
      place-items: center;
      z-index: 1;
    }
    .back svg {
      width: calc(72 * var(--u));
      height: calc(72 * var(--u));
      fill: none;
      stroke: #fff;
      stroke-width: 8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: none;
    }
    .scroll::-webkit-scrollbar {
      display: none;
    }
  `,
})
export class PageShellComponent {
  /** Screen title, uppercased by CSS. Omit for no title. */
  readonly heading = input<string>();
  /** Router commands for the parent screen. Omit to hide the back arrow (Home). */
  readonly backLink = input<string[]>();
  /** true: the content area fills the whole screen, under the header. */
  readonly contentBehindHeader = input(false);
}
