---
name: project-review
description: Full review of the app code against AGENTS.md, docs/angular/coding-guidelines.md, the functional requirements and Angular best practices, reported as a grouped, prioritized list (Architecture / Breaks AGENTS.md rules / Smaller issues). Use when the user asks to review the code, re-do the review, or invokes /project-review. Review only, never edits code.
---

# Project review

Review the whole app as it is now and report a work list. Never edit code during the review.

## 1. Load everything first

Read all of it before writing a single finding, so nothing is guessed or filled in later:

- `AGENTS.md`: project-specific rules and **Project decisions** (the rules change often, always re-read it; never rely on an earlier review's idea of the rules)
- `docs/angular/coding-guidelines.md`: the general coding rules, most rules live here
- `docs/angular/best-practices.md`: official Angular guidance (skip its Accessibility section, out of scope)
- `docs/functional-requirements.md`
- `docs/setup.md`
- `angular.json`, `package.json`, `tsconfig*.json`
- every file under `src/` (all `.ts`, `.html`, `.css`, specs included; skim `workouts.json`)
- list `public/` to spot unused assets

Dumping them into one file in the scratchpad and reading it in one go works well.

## 2. Check

- **Architecture:** how responsibilities are split, coupling between features/shared, duplicated lookups or markup, dead branches and dependencies, components reaching into each other, inconsistent patterns between similar pieces.
- **Rules:** go through every rule in `docs/angular/coding-guidelines.md` and `AGENTS.md` and check each one against the code (naming, suffixes, units in names, folder structure, constants and types, `Renderer2` vs raw DOM, async/RxJS and timers, precise types, logic in templates, styling between components, tests, no accessibility features, braces).
- **Requirements:** behaviour that contradicts `docs/functional-requirements.md`, and tests that conflict with it.
- **Smaller issues:** fragile code, manual cleanup where Angular has a helper, vague names, unused fonts/files.

Only report verified findings. Drop anything `AGENTS.md` or the guidelines explicitly allow, and never flag a choice listed under **Project decisions** in `AGENTS.md`. When `AGENTS.md` and the guidelines disagree, `AGENTS.md` wins.

**Only report what's worth acting on.** There's no quota, so don't pad the list. A short list is fine, and so is an empty one. Before keeping a finding, ask whether a reviewer would actually ask for this change in a pull request. Drop it if:

- it's a matter of taste, or the fix is no clearer than the current code
- it only rewords or moves code without making it easier to follow or harder to break
- it's speculative ("could become a problem if...") and there's no concrete case behind it
- the rule it cites is a stretch for this code, or the rule exists but the fix would cost more than it gains

## 3. Report

One fresh review, as if it were the first. Never add "new since last review" or "still open" sections, and don't refer to earlier reviews.

Format: three headed groups, numbered continuously across groups, most important first inside each group.

**Architecture**
1. Short problem statement with `file:line`, then the concrete fix in one sentence.

**Breaks the rules (AGENTS.md / coding guidelines)**
n. Which rule (and which file it is in), where, and the fix.

**Smaller issues**
n. ...

Keep each item to one or two lines. No tables. Leave out a group that has no findings. If nothing is worth changing, say so in one line. End with one line saying no files were changed.
