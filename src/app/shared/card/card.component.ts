import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardActionTextSize } from '../constants/card-action-text-size.constants';

/**
 * Glass card that navigates when tapped anywhere on it (FR-5).
 * Shows a heading, an optional detail line and a decorative action label (e.g. "Pradėti").
 */
@Component({
  selector: 'app-card',
  imports: [RouterLink],
  template: `
    <button type="button" class="card glass" [routerLink]="link()">
      <span class="card-heading">{{ heading() }}</span>
      @if (detail()) {
        <span class="card-detail">{{ detail() }}</span>
      }
      <span class="card-action glass" [class.card-action-small-text]="hasSmallActionText()">
        {{ actionLabel() }}
      </span>
    </button>
  `,
  styles: `
    .card {
      width: calc(350 * var(--u));
      height: calc(150 * var(--u));
      border-radius: calc(20 * var(--u));
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
    }
    .card-heading {
      font-weight: 700;
      font-size: calc(30 * var(--u));
      line-height: 1.17;
    }
    .card-detail {
      font-weight: 300;
      font-size: calc(17 * var(--u));
      line-height: 1.2;
      text-transform: none;
    }
    .card-action {
      margin-top: calc(6 * var(--u));
      width: calc(172 * var(--u));
      height: calc(42 * var(--u));
      border-radius: calc(10 * var(--u));
      display: grid;
      place-items: center;
      font-weight: 300;
      font-size: calc(27 * var(--u));
    }
    .card-action-small-text {
      margin-top: calc(14 * var(--u));
      font-size: calc(22.5 * var(--u));
    }
  `,
})
export class CardComponent {
  /** Route the card navigates to. */
  readonly link = input.required<string[]>();
  readonly heading = input.required<string>();
  /** Optional second line under the heading (e.g. "51 min"). */
  readonly detail = input<string>();
  /** Text of the action label. It is decorative: the whole card is the tap target. */
  readonly actionLabel = input.required<string>();
  readonly actionTextSize = input<CardActionTextSize>(CardActionTextSize.NORMAL);

  protected readonly hasSmallActionText = computed(
    () => this.actionTextSize() === CardActionTextSize.SMALL,
  );
}
