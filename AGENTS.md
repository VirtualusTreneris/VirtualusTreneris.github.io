# Agent guidelines: Virtualus Treneris

Project-specific rules. Read these three first:

1. [`docs/functional-requirements.md`](docs/functional-requirements.md): **what the app must do.** Read it before changing behaviour, and update it when a new requirement is agreed.
2. [`docs/angular/coding-guidelines.md`](docs/angular/coding-guidelines.md): **how code is written** (reusable across Angular projects).
3. [`docs/angular/best-practices.md`](docs/angular/best-practices.md): official Angular guidance the guidelines build on.

The rules below apply to this project only, and override the files above where they disagree.

## Scope

- **No accessibility features, at all.** This app runs only on one gym touchscreen; accessibility is deliberately not wanted. Ignore the "Accessibility Requirements" section of `best-practices.md`, and do not add:
  - `aria-*` attributes, `role`, `alt` text, `title` on iframes or other screen-reader labels
  - visually hidden headings or text, focus management, skip links, `tabindex`
  - semantic changes made for accessibility (e.g. swapping `<button>` for `<a>`)
  - If a reviewer or tool (AXE, lint) asks for these, don't add them.

## Project layout

```
src/app/
  features/
    category-list/  trainer-list/  workout-list/
    workout/                       the page for one workout (+ YouTube player states)
      video-player/                YouTube video in a sandboxed iframe + IFrame API loader
        video-controls/            our play/pause, rewind, fast forward overlay
  shared/
    card/  card-grid/  page-shell/ shared components
    constants/                     screen modes, card action text sizes
    resolvers/                     category / trainer / workout resolvers
    data/                          workouts.json: all categories, trainers and videos
    services/                      auto-return, browser action blocker, workout library
    types/                         workout library, screen-mode route data
```

- All videos, trainers and categories are in `shared/data/workouts.json`. See `docs/setup.md` for how to edit it.
- Each route sets `data.screenMode` (`home` / `browsing` / `player`); the auto-return timers depend on it.

## Project decisions

- **Routes are flat on purpose** (`app.routes.ts`), not nested category → trainer → workout. Each resolver repeating its parent lookups is fine for a small in-memory list, and back links are explicit (`['/', category.id]`) instead of relative `['..']`. Don't flag or change this.
- The standard `@angular/youtube-player` fallback (`USE_SANDBOXED_PLAYER` in `workout.component.ts`) is kept on purpose. Don't remove it without agreeing first.
- Our custom video controls can be switched off with `USE_CUSTOM_CONTROLS`; both modes must keep working.
- Sizes use the `--u` CSS unit (1 design px on the 1920×1080 target), defined in `styles.css`.
