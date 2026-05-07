# Claude Code Project Rules

## Core Principle

Use a single-agent workflow by default.

Do not create multi-agent teams unless explicitly requested.

Use the smallest effective skill set.

Default skill responsibilities:

1. `planning-with-files`
   - Daily task planning
   - Stage summaries
   - Progress tracking
   - Handoff context for future conversations

2. `superpower / systematic-debugging`
   - Bug fixing
   - Root cause analysis
   - Evidence-based debugging

3. `superpower / verification-before-completion`
   - Mandatory verification after code changes
   - No completion claim without evidence

4. `gstack / plan-eng-review`
   - Large direction decisions
   - Architecture review
   - Complex task planning
   - Engineering plan review before implementation

5. `supabase-postgres-best-practices`
   - Supabase
   - PostgreSQL
   - SQL
   - RLS
   - migrations
   - schema and database access logic

6. `microsoft/playwright-cli`
   - Browser verification
   - Login flow
   - cookies
   - redirects
   - console errors
   - network requests
   - API response inspection

Do not use extra skills unless clearly necessary.

Do not automatically:
- create git branches
- commit code
- perform large refactors
- introduce unrelated dependencies

---

## Model Usage Rules

Prefer Sonnet as the daily implementation model.

Use Opus for:
- architecture planning
- complex debugging
- authentication and permission logic
- Supabase RLS
- database schema design
- important implementation affecting multiple modules
- high-risk changes

Avoid Haiku for:
- coding
- debugging
- database changes
- authentication flow
- RLS
- architecture decisions
- important implementation

If the current runtime model appears to be Haiku, stop before making important code changes and ask the user to switch to Sonnet or Opus.

Recommended model usage:

- Normal coding: Sonnet
- Normal bug fixing: Sonnet
- Complex bug root cause analysis: Opus preferred
- Architecture planning: Opus preferred
- Database/RLS design: Opus preferred
- Browser verification summary: Sonnet
- Simple formatting or short summaries: Haiku allowed only if no code or architecture decision is involved

---

## `planning-with-files` Rules

Use `planning-with-files` for daily task planning, stage tracking, and handoff context.

The goal is not only to create a plan, but to preserve project context for future conversations.

Maintain these files:

1. `docs/PROJECT_STATUS.md`
   - Overall project status
   - Current progress
   - Completed modules
   - Active module
   - Main risks
   - Next stage goal

2. `docs/STAGE_LOG.md`
   - Append a summary after each completed stage
   - Include goal, completed work, changed files, verification results, remaining issues, and next step

3. `docs/NEXT_CONTEXT.md`
   - Short handoff document for the next conversation
   - Must be concise and practical
   - Should allow the next Claude Code session to continue without re-explaining everything

4. `docs/TASK_BOARD.md`
   - Current tasks
   - Completed tasks
   - In-progress tasks
   - Blocked items
   - Risks

When starting a stage:
- Read existing planning files first.
- Create missing files if needed.
- Write a short executable plan.
- Do not over-document.
- Do not start coding before the plan is clear.

When finishing a stage:
- Update all planning files.
- Append to `docs/STAGE_LOG.md`.
- Refresh `docs/NEXT_CONTEXT.md`.
- Update `docs/TASK_BOARD.md`.
- Record verification results.
- Record remaining risks.
- Record what the next session should do first.

`docs/NEXT_CONTEXT.md` should include:

```md
# Next Context

## Current Project Status
- ...

## Recently Completed
- ...

## Current Issues / Remaining Work
- ...

## Recommended Next Steps
1. ...

## Key Files
- ...

## Verification
- TypeScript:
- Lint:
- Build:
- Playwright:
- Supabase/Postgres:

## Do Not Repeat
- ...

## Notes
- ...