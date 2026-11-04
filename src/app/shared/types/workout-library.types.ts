/** Shape of `workouts.json`. Read-only: the app never changes the library. */

export interface Workout {
  readonly id: string;
  readonly title: string;
  readonly durationMinutes: number;
  readonly youtubeVideoId: string;
}

export interface Trainer {
  readonly id: string;
  readonly name: string;
  /** Name in the Lithuanian instrumental case, used after "su" in titles (e.g. "su Mindaugu"). */
  readonly nameInstrumental: string;
  readonly workouts: readonly Workout[];
}

export interface Category {
  readonly id: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly trainers: readonly Trainer[];
}
