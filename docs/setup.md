# Setup

Built with Angular. Videos play in our own sandboxed YouTube embed (links inside the video can't open anything), with `@angular/youtube-player` kept as a fallback player. No backend: it builds to a static site hosted on GitHub Pages at <https://virtualustreneris.github.io/>.

## Adding or removing a video

All videos are in **`src/app/shared/data/workouts.json`**. Edit that one file and push to `main`.

```jsonc
{
  "id": "funkcine-5",
  "title": "Funkcinė 5",
  "durationMinutes": 40,
  "youtubeVideoId": "XXXXXXXXXXX",
}
```

- `youtubeVideoId` is the part after `watch?v=` (or after `youtu.be/`). Unlisted videos work as long as embedding is allowed.
- `id` appears in the URL and must be unique within its trainer. Use lowercase letters, digits and `-`.
- Array order is display order.
- Write text in natural case with Lithuanian letters. The screen shows it in uppercase.
- A new trainer needs `id`, `name` and `nameInstrumental` (the instrumental form used in titles, e.g. "Mindaugu", "Greta").

After editing, `npm test` checks that the file still matches the expected types.

## Timers

All auto-return durations are in `RETURN_HOME_DELAYS` in `src/app/shared/services/auto-return-home.service.ts`. The behaviour is described in `docs/functional-requirements.md`.

## Development

```bash
npm ci
npm start          # http://localhost:4200
npm test           # unit tests (Vitest)
npm run build      # dist/virtualus-treneris/browser
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: test, build, then deploy to GitHub Pages.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The app uses hash URLs (`/#/funkcine/mindaugas`), so refreshes and deep links never 404 on Pages.

## Kiosk PC setup

Run Chrome in kiosk mode:

```
chrome --kiosk --autoplay-policy=no-user-gesture-required --disable-pinch --overscroll-history-navigation=0 --noerrdialogs --disable-translate https://virtualustreneris.github.io/
```

- Turn off the OS screen sleep, screen lock and screensaver.
- Lock the kiosk browser to this site as an extra safeguard, for example with a Chrome URL allowlist policy (`URLBlocklist: ["*"]`, `URLAllowlist: ["virtualustreneris.github.io", "youtube.com", "youtube-nocookie.com", "googlevideo.com", "ytimg.com", "fonts.googleapis.com", "fonts.gstatic.com"]`).
