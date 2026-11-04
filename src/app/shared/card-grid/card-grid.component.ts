import { Component } from '@angular/core';

/** Two-column grid of cards, centred, used on the Trainers and Workouts screens. */
@Component({
  selector: 'app-card-grid',
  template: `<ng-content />`,
  styles: `
    /*
     * min-height 70vh is intentional: it copies the original design, which spreads the card rows
     * over about 70% of the screen height, so a short list doesn't bunch up under the title.
     */
    :host {
      width: 60vw;
      min-height: 70vh;
      margin: 0 auto;
      padding-bottom: calc(40 * var(--u));
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: max(15px, calc(15 * var(--u)));
      align-items: center;
      justify-items: center;
    }
  `,
})
export class CardGridComponent {}
