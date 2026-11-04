/**
 * Text size of a card's action label: SMALL for longer labels ("Pasirinkti"), NORMAL for short ones.
 * The label's box stays the same size; only the text (and the gap above it) changes.
 */
export const CardActionTextSize = {
  SMALL: 'small',
  NORMAL: 'normal',
} as const;

export type CardActionTextSize = (typeof CardActionTextSize)[keyof typeof CardActionTextSize];
