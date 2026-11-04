/**
 * Which auto-return rules apply on a screen:
 * HOME = no timer, BROWSING = idle timer restarted on activity, PLAYER = timer driven by the video.
 */
export const ScreenMode = {
  HOME: 'home',
  BROWSING: 'browsing',
  PLAYER: 'player',
} as const;

/** One of the screen modes above, e.g. `ScreenMode.BROWSING`. */
export type ScreenMode = (typeof ScreenMode)[keyof typeof ScreenMode];
