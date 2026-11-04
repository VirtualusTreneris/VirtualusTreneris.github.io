/**
 * YouTube IFrame API player states, as plain numbers.
 * The built-in `YT.PlayerState` only exists after YouTube's script has loaded, so it can't be used here.
 */
export const YoutubePlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

/** One of the player states above, e.g. `YoutubePlayerState.PLAYING`. */
export type YoutubePlayerState = (typeof YoutubePlayerState)[keyof typeof YoutubePlayerState];
