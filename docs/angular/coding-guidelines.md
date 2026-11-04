# Angular coding guidelines

Reusable coding rules for Angular projects. Copy the whole `docs/angular/` folder into a project and point its `AGENTS.md` to it.

- Follow [`best-practices.md`](best-practices.md) (official Angular guidance) for all code. This file adds to it.
- The project's own `AGENTS.md` can override or extend any rule here; when they disagree, `AGENTS.md` wins.

## Working with agents

- Write code for the developer who reviews it. If a reviewer would flag it in a pull request, don't write it.
- Do not edit code during a review or discussion unless explicitly asked to make a change.
- Reach for the Angular way first. Code should look like Angular, not plain JavaScript.

## Angular APIs

- Navigation uses `routerLink`, not `router.navigate()` called from templates.
- Use injected `DOCUMENT` instead of the `window`, `document` and `location` globals.
- Use Angular APIs (`host` listeners, `Renderer2.listen()`, services) instead of raw `addEventListener` and standalone functions.
- Services can't inject `Renderer2` directly: use `inject(RendererFactory2).createRenderer(null, null)`.

## Project structure

- At the top level of `src/app/`, organize by feature, not by type of code: only `features/` and `shared/`. No top-level `core/`, `data/`, `services/`, `screens/` or `pages/` folders.
- `features/<name>/`: one folder per routed feature, named by what it shows (`product-list`, `order`). Code used only by one feature lives in its folder.
- Every component gets its own folder, inside features too. A component used by only one other component lives inside that component's folder: `order/payment-form/card-input/`.
- `shared/`: code used by more than one feature or app-wide. Shared code never imports from `features/`.
  - Group non-component code by kind: `shared/services/`, `shared/types/`, `shared/constants/`, `shared/resolvers/`, `shared/data/` (static data files such as JSON) (similar general folders are fine). Put each file in the folder for what it is: a constant goes in `constants/`, even if it also exports a matching type.
  - Only components get a folder of their own: `shared/page-shell/`.
  - Never create a folder named after a single file or constant (e.g. `shared/order-status/` holding only `order-status.ts`).
- If a placement feels forced, the dependency is probably wrong: fix the dependency, don't invent a folder.

## Architecture

- **Data and lookups live in a service**, with interfaces in a separate `*.types.ts` file. No exported loose functions, and no exported data constants (e.g. a list of products).
  - Configuration constants are fine to export when kept next to the code that uses them, with `as const` (e.g. `SESSION_TIMEOUTS` with all the delays in one place, which tests can also use).
- **Routes carry their own facts.** Behaviour that depends on the current screen reads route `data`, never the URL's shape or depth. If every route must set some `data`, a test checks the route list for it.
- **No silent fallbacks for missing configuration.** When required config is missing, report it through Angular's `ErrorHandler` (and catch it in a test), instead of quietly falling back to a default that turns a feature off.
- **Resolvers load what a route needs.** A route turns its URL ids into objects with resolvers (unknown id → `RedirectCommand`) and the component gets them as inputs (`withComponentInputBinding()`). Components don't look things up by id or guard against missing data with `@if`.
- **Repeated UI is a component.** If the same markup appears on two screens, make it a shared component with its own styles. Global `styles.css` only holds resets, theme variables and true utilities.
- **Components style only themselves.** The parent sizes and positions a child's host element (via a class on it, e.g. `class="controls-overlay"`); the child fills its `:host` and never positions itself (no `position: absolute/fixed` or `inset` on `:host`). Exception: layout components whose size is their whole purpose may size themselves (a page shell that fills the screen, a grid with a set width). No `::ng-deep` into our own components. The only exception is third-party components that can't be styled otherwise, with a comment.
- **App-wide services start explicitly.** They expose `start()` and are called from `provideAppInitializer`. No work as a side effect of `inject()` or the constructor.
- **Keep fallbacks on purpose, with a comment.** Code kept only as a fallback says why it's kept and what it doesn't support, so no one removes or "fixes" it by accident.
- **Shared code must not know a feature's details.** If a shared service needs feature-specific types, reconsider the dependency first.

## Async code

- Avoid promises. Use RxJS for async work and events, and signals for state.
- A promise is only OK when an Angular or browser API requires or returns one (`loadComponent: () => import(...)`, `router.navigate()`), or for work that runs once, gives a single result, can't be cancelled and is shared by every caller (e.g. loading a third-party script once).
- Convert a promise to an Observable with `from()` where it's used, so the caller gets cancellation (`takeUntilDestroyed()`) instead of manual `destroyed` flags.
- No `async`/`await` or `.then()` chains in components.
- Timers use RxJS, not `setTimeout`/`clearTimeout`: push to a `Subject` and `switchMap` to `timer(ms)` (a new value restarts it, `EMPTY` stops it), with `takeUntilDestroyed()` or `toSignal()` for cleanup. One pattern for every timer in the app.

## Code style

- Every `if`, `else`, `for` and `while` uses a braced block, even for one statement and early returns: `if (x) { return; }` on separate lines, never `if (x) return;`.
- Make the flow of each component easy to follow: avoid clever shortcuts, unnecessary aliases and logic in templates (call a method instead, e.g. `(click)="rewind()"`, not `(click)="seekBy(-step)"`).
- Templates call the component's own methods, never injected services: `(change)="onStatusChange($event)"`, not `(change)="orderService.update($event)"`. Keep injected services `private`.

## Naming

- Name things by what they do or are, so someone can guess the behaviour from the name alone (`SessionTimeoutService`, not `SessionManager`). When renaming, start from "what does this actually do?", not from fixing just the one problem with the old name.
- Components are named after what they are, not after one behaviour they were built for (`VideoPlayerComponent`, not `LinkBlockingVideoPlayerComponent`).
- Use type suffixes in file and class names, so the kind of file is obvious at a glance: `order-sync.service.ts` / `OrderSyncService`, `product-card.component.ts` / `ProductCardComponent`. Configure the CLI for this in `angular.json` (`schematics`: `type: "component"`, `type: "service"`, `type: "directive"`, and `typeSeparator: "."` for guards, pipes, resolvers, interceptors, modules).
- Avoid vague filler words when they're used as a label instead of a description: `data`, `content`, `info`, `manager`, `helper`, `utils` (`UserDataService` is a bad name; `UserDirectoryService` says what it is). The word itself isn't banned when it's accurate: `shared/data/` for a folder of data files is fine.
- Use plain, descriptive names over jargon. Method names say what they do (`startTimer()`, not `begin()`); a short name like `start()` is fine when the class name already gives the context (`SessionTimeoutService.start()`).
- Don't reuse Angular terms for unrelated things (e.g. "guards" for DOM listeners, when Angular guards are route guards).
- Units must be clear. Write ambiguous ones in full (`durationMinutes`, not `durationMin`, which could read as "minimum"). Standard unit suffixes are fine and preferred for time in code: `Ms` for milliseconds (`idleTimeoutMs`), also `Px`. Seconds are written in full (`seekStepSeconds`).
- Established Angular/frontend terms are fine (`PageShellComponent`, `CardComponent`).
- One name per concept, everywhere it appears: the input, its CSS class, the output, the handler, the method it calls and the test (`detail` → `.card-detail`; `fastForward` output → `onFastForward()` → `fastForward()`). Not `detail` in one place and `duration` or `forward` in another.

## Dependencies

- Delete dependencies nothing imports (e.g. packages `ng new` added by default), and declare every type package you rely on (`@types/...` in `devDependencies` and `types` in `tsconfig`) instead of getting it through another package.

## Types

- Use precise types that match how a value is actually used. No `unknown[]` / `any` just to mirror a loose framework signature (router commands that are always strings are `string[]`).
- No non-null assertions (`!`) in app code. Handle `null`/`undefined` explicitly, or keep the type honest. They're fine in tests.
- No string literal unions (`'small' | 'normal'`) and no magic numbers for a fixed set of values. Use a constant object with `as const` plus a type of the same name, and refer to values through it, so no raw strings or numbers are scattered around the code:
  `export const OrderStatus = { OPEN: 'open', PAID: 'paid' } as const;`
  `export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];`
  Use `OrderStatus.PAID`, never `'paid'`; get the list of values with `Object.values(OrderStatus)`. In templates, expose the object on the component (`protected readonly OrderStatus = OrderStatus;`). Name these files `*.constants.ts`. Shared ones go in `shared/constants/`; one used by a single feature sits directly in that feature's folder, next to the code that uses it (no `constants/` subfolder inside features). Cast once where an outside API hands a value in, with a comment.

## Constants

- Put constants next to the code they describe. Don't put another domain's constants in a service just because the service uses them.
- Upper-case constants are really constant: use `as const` for objects.

## Tests

A test exists to catch a real mistake. If it can't fail for a reason anyone cares about, it shouldn't exist.

### What to test

- **Requirements and rules first.** Every rule in the functional requirements that has logic behind it (timers, redirects, validation, permissions) gets tests. Name the requirement in the test or `describe` when there is one (`FR-7: unknown ids redirect Home`).
- **Edges and boundaries**, not just the happy path: the moment just before and at a limit, empty lists, unknown ids, the second call, leaving a screen mid-way. For a 5-minute timer: nothing at 5 min − 1 ms, Home at exactly 5 min.
- **Bugs you fix.** Write the test that fails without the fix, then fix it, so the bug can't come back.
- **Skip what has no logic:** plain templates, simple getters, constants, Angular itself. Don't keep the CLI's default "should create" / "should be truthy" specs; they only prove the framework works.

### How to test

- **Test what the user or caller sees**, through the public API: rendered text, navigation, emitted outputs, return values, service calls at the boundary. Not private methods, internal signals or the order of internal calls. A refactor that keeps the behaviour must not break the tests.
- **Find elements by a stable name**, never by position: `querySelector('.button-play')`, not `querySelectorAll('button')[1]`. Give elements a distinct class if they don't have one, so reordering the markup can't silently break a test.
- **Cover every case of a rule**, not just one example: if back links are built by hand on three screens, test all three.
- **One behaviour per test**, with a name that states it as a fact: `returns Home 20 s after the video ends`, not `test timer` or `should work`.
- **Arrange, act, assert**, in that order and visibly separate. Hide repeated setup in small helpers with meaningful names (`goTo(url)`, `advance(ms)`, `expectWentHome()`), so each test reads like the rule it checks.
- **Test each component at its own edges.** A parent's test may trigger a child component's public outputs directly (`child.componentInstance.someOutput.emit(...)`); what makes the child emit is tested in the child's own spec. Don't fake a grandchild's dependency (e.g. a third-party SDK used by the child) just to test the parent.
- **Mock only the boundaries**: the router, HTTP, browser APIs, third-party SDKs, time. Never mock the thing under test. Use fake timers for anything time-based; never wait for real time.
  - Don't tie the fake clock to real time (`useFakeTimers({ shouldAdvanceTime: true })`). When Angular itself needs timer ticks (router navigation, change detection, `whenStable()` hangs), step the fake clock with `vi.waitFor(() => expect(...))` or `vi.advanceTimersByTimeAsync()`.
- **Deterministic and independent.** No real network, no randomness, no dependence on test order; each test cleans up what it starts (timers, listeners).
- **Expected values come from the test, not from the code.** Don't recompute the expected result with the same logic the code uses; that only proves the code equals itself.

### Data and content

- Test behaviour and rules, never a snapshot of content that's meant to change. A test must not fail just because someone edited the content the way they're supposed to.
- For editable data (e.g. a JSON file), test that it's valid (required fields, unique ids, sensible values), not how many items it has or what they're called. Bad: `expect(workouts.length).toBe(42)`.
- When a test needs real content (e.g. a page that shows an item from the data), read it from the data source and compare against that, instead of hard-coding ids, titles or counts. Bad: `navigateByUrl('/shoes/nike')` then `expect(title).toBe('Nike shoes')`. Good: take the first item from the service, navigate to its URL, and expect its own title.

### Check that a test is worth keeping

- **Break the code on purpose once** (remove the line the test is about). If the test still passes, it tests nothing: fix it or delete it.
- **Ask what it protects.** If you can't name the requirement, rule or bug it guards, delete it.
- **Fewer, sharper tests beat many shallow ones.** Coverage numbers are not a goal.

## Requirement docs

- Keep a functional requirements doc (e.g. `docs/functional-requirements.md`) describing what the app must do, and keep it up to date when requirements change.
- Requirement docs and briefs for agents describe behaviour only, never how to code it: no code snippets, interfaces, names, file paths or class structure.
