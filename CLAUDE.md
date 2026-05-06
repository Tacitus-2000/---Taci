# Claude Code Project Rules

## Core Principle

Use a single-agent workflow by default.

Do not create multi-agent teams unless explicitly requested.

Use the smallest effective skill set.

Default skill responsibilities:

1. `planning-with-files`
   - Daily task planning
   - Progress tracking
   - Short execution checklist

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

## Skill Usage Rules

### 1. `planning-with-files`

Use for daily task planning and progress tracking.

Use when:
- starting a task with more than one step
- fixing a bug that may touch multiple files
- implementing a feature
- tracking progress across several edits

Rules:
- Keep plans short.
- Prefer checklist format.
- Do not write long planning documents unless requested.
- Update progress only after meaningful milestones.
- Do not use planning as a substitute for reading code or verifying results.

---

### 2. `superpower / systematic-debugging`

Use for bug fixing.

Required process:
1. Read relevant files.
2. Locate the actual failure point.
3. List likely causes.
4. Verify causes with evidence from code, logs, terminal output, browser behavior, or database results.
5. Modify only after evidence is found.
6. Make the smallest safe fix.
7. Check all related call sites.

Do not:
- guess the root cause
- modify code before reading relevant files
- refactor unrelated code
- fix only the surface symptom

---

### 3. `superpower / verification-before-completion`

Use after every code change.

Do not claim completion before verification.

Report:
- TypeScript result
- Lint result
- Build result
- Playwright result, if browser behavior is involved
- Supabase/Postgres result, if database work is involved
- Remaining risks

---

### 4. `gstack / plan-eng-review`

Use only for large direction, complex tasks, or architecture decisions.

Use when:
- the task affects multiple modules
- the task changes data flow
- authentication or permission architecture may be affected
- database structure may need redesign
- API boundaries are unclear
- frontend/backend responsibility is unclear
- the solution may require refactoring
- the user asks for architecture review, engineering review, or plan review

Rules:
- Use it before implementation, not after.
- Keep the review concise.
- Output practical recommendations.
- Do not create a multi-agent team.
- Do not invoke other gstack roles unless explicitly requested.
- Do not turn small bug fixes into architecture projects.

Expected output:
1. Current problem framing
2. Architecture impact
3. Recommended approach
4. Files/modules likely affected
5. Risks and edge cases
6. Verification plan
7. Whether implementation should proceed

---

### 5. `supabase-postgres-best-practices`

Use only when the task involves:
- Supabase
- PostgreSQL
- SQL
- migrations
- RLS
- schema
- tables
- columns
- indexes
- constraints
- database functions
- backend database access logic

Rules:
- Do not guess table names.
- Do not guess column names.
- Do not modify RLS casually.
- Never expose service role keys to client-side code.
- For RLS changes, explain:
  - who can read
  - who can insert
  - who can update
  - who can delete
  - how tenant/client isolation is enforced

---

### 6. `microsoft/playwright-cli`

Use only when browser behavior must be verified, including:
- login flow
- redirects
- cookies
- sessions
- API response inspection
- console errors
- network requests
- page runtime errors
- blank pages
- `Unexpected token '<'`
- login succeeds but page state is wrong
- one page works but another page fails

For `Unexpected token '<'`, inspect:
1. failed request URL
2. status code
3. content-type
4. response body
5. whether HTML was returned
6. whether it is a 404 page, login page, middleware redirect, or Next.js error page

---

## Default Execution Flow

For normal development tasks:

1. Use `planning-with-files` to create a short plan.
2. Read relevant files.
3. If fixing a bug, use `superpower / systematic-debugging`.
4. If the task is large or architectural, use `gstack / plan-eng-review` before implementation.
5. If database work is involved, use `supabase-postgres-best-practices`.
6. Make the smallest safe change.
7. Run available checks.
8. If browser behavior is involved, use `microsoft/playwright-cli`.
9. Use `superpower / verification-before-completion`.
10. Update the planning file with results and remaining risks.
11. Report evidence.

For small one-file changes:
- Planning may be very short.
- Do not use gstack.
- Do not over-document.
- Still verify before completion.

For large direction or architecture tasks:
- Use `gstack / plan-eng-review`.
- Do not implement until the scope and risks are clear.
- Keep the plan concise and executable.

---

## Mandatory Checks After Code Changes

After every code change, inspect `package.json` and run available checks.

Prefer:

```bash
npm run typecheck
npm run lint
npm run build