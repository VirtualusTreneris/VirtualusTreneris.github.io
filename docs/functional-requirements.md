# Functional requirements

What the app must do. This file describes behaviour only, never how to code it; for that, see `AGENTS.md`.

## Context

A touchscreen kiosk in the OxyGym gym (Klaipėda). Gym members walk up, pick a workout and follow a YouTube training video on the big screen. Nobody supervises the screen, so the app must always find its way back to the start screen, and users must not be able to leave the app.

- Target screen: 1920×1080 landscape touchscreen. Other sizes must still look right.
- All UI text is Lithuanian. Page language `lt`, page title "Virtualus Treneris", with a favicon.
- Hosted as a static site on GitHub Pages (`VirtualusTreneris/VirtualusTreneris.github.io`), served from the domain root.
- **Accessibility is out of scope.** The app has no accessibility features, and none should be added.

## Content

- **C-1** All categories, trainers and workouts come from one JSON file. Editing that file is the only thing needed to add or remove a video.
- **C-2** The order in the file is the display order. Never sort.
- **C-3** Text is stored in natural case with Lithuanian letters (ė, į, š…); screens show it in uppercase.
- **C-4** Each trainer also has a name in the Lithuanian instrumental case, used in titles ("su Mindaugu", "su Greta").
- **C-5** Videos are unlisted YouTube videos that allow embedding.

## Screens and flow

Four screens: Home (categories) → Trainers → Workouts → Player.

| Screen   | URL                            | Title                                                                           | Back arrow       |
| -------- | ------------------------------ | ------------------------------------------------------------------------------- | ---------------- |
| Home     | `/`                            | VIRTUALUS TRENERIS                                                              | hidden           |
| Trainers | `/:category`                   | category title, e.g. "FUNKCINĖ TRENIRUOTĖ"                                      | goes to Home     |
| Workouts | `/:category/:trainer`          | "{category short title} su {trainer instrumental name}", e.g. "PRESAS SU GRETA" | goes to Trainers |
| Player   | `/:category/:trainer/:workout` | none                                                                            | goes to Workouts |

- **FR-1 Home** shows one button per category, in data order. There is no separate splash screen: the category list is Home.
- **FR-2 Trainers** shows one card per trainer: the name and a "PASIRINKTI" pill.
- **FR-3 Workouts** shows one card per workout: the title, the duration as "51 min", and a "PRADĖTI" pill.
- **FR-4 Player** shows the video, which starts automatically, with sound.
- **FR-5** The whole card is the tap target, not only its text.
- **FR-6** The back arrow goes up exactly one level (to the parent screen), no matter how the user got there. Hidden on Home.
- **FR-7** Unknown or invalid URLs (bad id, typo) go to Home.
- **FR-8** It is a single-page app: no full page reloads between screens (keeps unmuted autoplay allowed).
- **FR-9** Lists scroll vertically by touch when they don't fit; the title and back arrow stay visible.
- **FR-10** Cards and buttons shrink slightly (to 95%) while pressed.
- **FR-11** URLs use the hash (`/#/...`), so refreshing or opening a deep link never shows a 404 on GitHub Pages.

## Automatic return to Home

The most important behaviour. "Return to Home" means: go to Home, stop the video, and clear all timers.

| Screen / state                                    | Behaviour                                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Home                                              | No timer. Home can stay on screen forever.                                                                            |
| Trainers, Workouts                                | Return Home after **5 min** without activity (tap, touch, wheel, scroll, key press). Any activity restarts the 5 min. |
| Player, loading or playing                        | No timer. Entering the player cancels the list timer.                                                                 |
| Player, paused                                    | Return Home after **5 min**. Resuming cancels it.                                                                     |
| Player, video ended                               | Return Home after **20 s**.                                                                                           |
| Player, other states (unstarted, buffering, cued) | The current timer is left unchanged.                                                                                  |
| Back from the Player                              | Player timers are cancelled; Workouts starts its own 5 min timer.                                                     |

- **T-1** Only one timer runs at a time; starting one replaces the previous one. No timer survives a navigation.
- **T-2** There is deliberately no fallback timer if a video never starts (autoplay blocked, video removed). The player stays until someone taps back. The owner chose this.
- **T-3** Every row of the table is covered by automated tests.

## Video player

- **VP-1** Starts automatically with sound, skips the first second, never loops, never mutes.
- **VP-2** No fullscreen button (fullscreen would escape the kiosk UI). No annotations; related videos only from the same channel.
- **VP-3** The video is centred, 16:9, as large as possible while staying clear of the back arrow: 1600×900 on a 1920×1080 screen. The background stays visible around it.
- **VP-4** Links inside the video (YouTube logo, Share, channel, title) can't open anything, so users can't leave the app through the video.
- **VP-5** YouTube's own right-click / long-press menu can't open on the video.

### Video controls

The app shows its own controls instead of YouTube's (needed for VP-5). It must remain possible to switch back to YouTube's own controls.

- **VC-1** Tapping anywhere on the video plays or pauses it.
- **VC-2** Buttons at the bottom of the video: rewind 10 s, play/pause, fast forward 10 s.
- **VC-3** While paused, the buttons are always visible.
- **VC-4** While playing, the buttons show after a tap on the video or a button, and fade out 4 s after the last tap.
- **VC-5** There is only one play button (no extra play icon in the middle of the video).
- **VC-6** Look: play/pause is a solid white circle with a dark icon; rewind/forward are white circular-arrow icons with "10" inside, no background; a dark gradient rises from the bottom of the video behind the buttons. The bar fades and slides in when it appears.

## Kiosk restrictions

The app must make it hard to zoom, select text, open menus or wander off.

- **K-1** No context menu (right click or touch long-press).
- **K-2** No zoom: no pinch, no double-tap zoom, no ctrl+wheel.
- **K-3** No text selection, no drag (including images and links).
- **K-4** No way to leave the app through the video (see VP-2, VP-4, VP-5).
- **K-5** No external links anywhere in the app.
- **K-6** No hover-only interactions; everything works by tap.
- **K-7** No pull-to-refresh, no overscroll bounce.
- **K-8** No visible scrollbars; touch scrolling still works.

Kiosk PC setup (documented in `docs/setup.md`, not app behaviour): Chrome in kiosk mode, autoplay allowed without a gesture, pinch and overscroll navigation disabled, error dialogs and translate off, OS screen sleep/lock off.

## Design

Match the replacement site (`https://oxygym.lt/virtualus-treneris/`), screenshots in `docs/design-reference/`, at 1920×1080.

- **Global:** Roboto (300 for light text, 700 for bold); white text; a purple/blue/black swirl background image filling the screen on every screen; a black fade over the bottom ~40% of the screen that content scrolls over.
- **Glass style** for every card, button and pill: 10% white background, 15px blur, 1px 30% white border.
- **Title:** centred near the top, bold, 50px, uppercase.
- **Back arrow:** white "<" chevron, 72×72, top-left (about 63px from the left, 40px from the top), with a tap area of at least 96×96.
- **Home:** one centred column of 4 buttons, 500×144px, 20px radius, ~36px gaps, light 35px uppercase labels.
- **Trainers / Workouts:** 2-column grid, 60% of screen width, centred, with the rows spread over at least ~70% of the screen height (so a short list doesn't bunch up under the title); cards 350×150px, 20px radius, filled left to right, top to bottom; scrolls instead of squeezing when there are more than 8 cards.
  - Trainer card: bold 30px name, then the "PASIRINKTI" pill.
  - Workout card: bold 30px title, light 17px duration, then the "PRADĖTI" pill.
  - Pills are decorative, ~172×42px, 10px radius; the whole card is the tap target.
- **Player:** back arrow, no title, centred video (VP-3).

## Not in scope

No admin panel or CMS, backend, analytics, search, filters, thumbnails, PWA/offline mode, i18n framework, trainer photos, or splash/attract screen. No timer rules beyond the ones above. No accessibility work. If something seems missing, raise it instead of building it.
