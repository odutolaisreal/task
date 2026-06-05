# DECISIONS.md

> Keep this short. Bullets are fine. Be specific and honest. We read every word.

## The feature: assignees + filtering

**What I built**
- Added optional assignees to tasks across SQLite, the API, and the React UI.
- Tasks can now be assigned when created, reassigned inline from the list, and filtered by assignee alongside the existing search/status filters.

**Decisions I made on the ambiguous parts**
- How I handled tasks with no assignee: kept assignee nullable in the DB and exposed an explicit `Unassigned` option in both the create form and filter.
- Single-select vs multi-select filter, and why: used single-select because the rest of the UI already uses simple single filters, and it keeps the API/query logic small for a take-home.
- How the assignee filter interacts with the existing status/search filter: all three filters combine with `AND`, so the list only shows tasks matching the current search text, status, and assignee selection.
- Where the filter state lives (URL, local state, etc.) and why: local component state, because the existing app already works that way and I stayed inside the current pattern instead of introducing routing/state sync just for this feature.

**Anything I assumed instead of asking**
- "Assign a task to a user" should work for both new tasks and existing tasks, so I added assignment at creation time and reassignment from the list.
- Existing databases might already exist locally, so I added a small schema backfill for `assignee_id` instead of assuming a fresh DB every time.

## The bug

- What the bug was: the create form allowed duplicate task creation if the user submitted multiple times before the first request finished.
- How I found it: by treating the UI like an impatient user and repeatedly submitting the form quickly.
- Why my fix is correct (and not just "it stopped happening"): the form now tracks an in-flight submit, disables the controls, and ignores repeated submits until the request resolves, so only one POST can be triggered per create action.
- Anything similar I noticed but didn't fix: quick filter changes can also create overlapping fetches; I added a small "latest request wins" guard while I was in there because it was the same class of UI race.

## Tradeoffs

- What I deliberately did NOT do, and why: I did not add routing, global state, pagination, tests, or a larger redesign. The goal here was to finish the requested feature cleanly inside the existing code shape.
- Where I leaned on AI, and what I changed or rejected from what it gave me: I used AI as a pairing tool for implementation speed and review, but kept the final shape close to the repo's current patterns. I rejected more abstract refactors and extra error-handling layers that felt oversized for this codebase.

## If I had more time

- Next thing I'd do: add focused API/UI tests around task creation, reassignment, and combined filtering.
- Where this design breaks at 10x or 100x the data: local-state-only filters, full list refetches after each mutation, and `%LIKE%` search on the whole tasks table will all start to hurt once the dataset grows.
- One thing about the existing codebase I'd want to refactor and why: centralize task query/serialization logic on the server so the selected task shape is defined once instead of repeated across route handlers.

## Time spent

- Roughly: 2-3 hours

## Deployment (optional)

- Live URL (if deployed): not deployed
- How I hosted it: n/a
- What I'd harden before real production: add tests, proper API error handling on the frontend, and move off SQLite/local process state for multi-user production use.
