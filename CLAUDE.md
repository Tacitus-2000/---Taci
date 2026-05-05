# Claude Code Project Rules

## Core Workflow

Use a single-agent workflow by default.

Default skills:

1. `superpower / systematic-debugging`
2. `superpower / verification-before-completion`
3. `supabase-postgres-best-practices`
4. `microsoft/playwright-cli`

Do not create multi-agent teams unless explicitly requested.

Do not use extra skills unless explicitly necessary.

Do not automatically:
- create git branches
- commit code
- perform large refactors
- introduce unrelated dependencies

---

## Working Principles

Act as one disciplined engineer.

Priority:

1. Find the real root cause.
2. Make the smallest safe change.
3. Avoid low-level mistakes.
4. Verify before reporting completion.
5. Report evidence, not guesses.

Do not modify code without reading relevant files first.

Do not guess the root cause.

Do not make large architectural changes for small bugs.

---

## Superpower Rules

Use only these two Superpower abilities by default:

### `systematic-debugging`

Use for bug fixing.

Required process:

1. Read relevant files.
2. Locate the actual failure point.
3. List likely causes.
4. Verify causes with code, logs, terminal output, browser behavior, or database results.
5. Modify only after evidence is found.
6. Make the smallest safe fix.
7. Check all related call sites.

### `verification-before-completion`

Use after every code change.

Do not claim completion before verification.

Report:

- TypeScript result
- Lint result
- Build result
- Playwright result, if browser behavior is involved
- Supabase/Postgres result, if database work is involved

---

## Supabase / Postgres Rules

Use `supabase-postgres-best-practices` only when the task involves:

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

Database rules:

1. Do not guess table names.
2. Do not guess column names.
3. Do not modify RLS casually.
4. Never expose service role keys to client-side code.
5. For RLS changes, explain:
   - who can read
   - who can insert
   - who can update
   - who can delete
   - how tenant/client isolation is enforced

---

## Playwright Rules

Use `microsoft/playwright-cli` only when browser behavior must be verified, including:

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

Do not assume it is only a JSON parsing issue.

---

## Mandatory Checks After Code Changes

After every code change, inspect `package.json` and run available checks.

Prefer:

```bash
npm run typecheck
npm run lint
npm run build