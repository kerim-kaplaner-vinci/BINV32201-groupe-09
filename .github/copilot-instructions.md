# Gesta project guidelines

## Build, test, and lint

Run commands from the repository root. The project requires Node.js `>=22.14.0` and
uses npm workspaces; `npm ci` installs the locked dependency tree.

```bash
npm ci
npm run setup                 # create backend/.env and initialize demo data
npm run dev                   # API :3000 and Vite UI :5173
npm run lint                  # Oxlint in both workspaces; warnings fail
npm run typecheck             # TypeScript checks in both workspaces
npm test                      # all backend and frontend Vitest tests
npm run build                 # compile both workspaces
npm run check                 # lint + typecheck + test + build
```

Run one test file, or one test name, from the root with the workspace selector:

```bash
npm run test -w backend -- tests/offers.test.ts
npm run test -w frontend -- tests/OffersPage.test.tsx
npm run test -w backend -- tests/offers.test.ts -t "returns published offers"
```

Database helpers are `npm run db:init` and `npm run db:reset` (the latter requires
stopping the dev server first). Do not use the development database for tests.

## Architecture

Gesta is a two-workspace TypeScript application:

- `backend/` is an Express API backed by a local SQLite database through
  `better-sqlite3`. `main.ts` loads configuration, initializes migrations and seed
  data, then starts the server; `app.ts` assembles the dependency graph and routes.
- Backend request flow is
  **controllers → services → repositories → SQLite**, with mappers translating
  database rows to domain objects and API DTOs. Authentication and authorization
  middleware run before protected controllers. Services contain business rules and
  must not depend on Express `Request` or `Response`.
- `frontend/` is a React/Vite application using React Router. Its flow is
  **pages → hooks → services/utils → models**, with reusable presentational
  components below pages. `App.tsx` is the single owner of `useAuth`; authenticated
  state and logout are passed to pages.
- In development the frontend calls `/api/...`; Vite proxies that prefix to the API
  at `http://localhost:3000` and removes `/api`.
- The API is currently read-only for companies and offers plus demo authentication.
  The broader target behavior and not-yet-implemented features are documented in
  [README.md](../README.md) and [docs/cdc_gesta_developpement.md](../docs/cdc_gesta_developpement.md).

For a complete map of the implemented request paths, consult
[docs/architecture.md](../docs/architecture.md). For route contracts and error
formats, update and consult [backend/API.md](../backend/API.md).

## Repository conventions

- Keep backend layers separate: SQL belongs in repositories, business visibility and
  permission rules belong in services, and HTTP parsing/status codes belong in
  controllers. Reuse named permission predicates from `backend/src/services/permissions.ts`
  and enforce access on the backend, not only by hiding frontend routes.
- Construct backend dependencies with the existing factory pattern
  (`create...Repository`, `create...Service`, `create...Router`) so production and
  in-memory test applications use the same wiring.
- Backend relative imports intentionally use `.ts` extensions; TypeScript rewrites
  them to `.js` in the build output. Preserve this convention.
- Authentication tokens contain only `{ kind, id }` and are sent as the raw
  `Authorization` header value, without a `Bearer` prefix. The backend reloads the
  account, roles, and company relationships on every request.
- Report expected API failures with `throw new HttpError(status, code, message)`.
  The central error handler produces `{ "error": { "code", "message" } }`.
  Frontend services should use `readJson` and type guards to validate response JSON;
  a 401 should flow through the hook's `onUnauthorized`/logout path.
- Add schema changes as a new ordered SQL file under
  `backend/src/db/migrations/` (for example `002_...sql`). Never edit an already
  applied migration. SQLite foreign keys are enabled by the database factory.
- Database status and enum values use English API/storage codes (`PUBLISHED`,
  `ACTIVE`, `P1`, etc.); French display labels belong in frontend utilities.
- Backend tests use Vitest/Supertest with isolated in-memory SQLite databases built
  by `backend/tests/helpers/testApp.ts`. Use `tokenFor(...)` and stable seed IDs for
  authenticated scenarios. Frontend tests use Vitest, Testing Library, jsdom, and
  the fetch mocks in `frontend/tests/helpers/fetchMock.ts`.
- When adding or changing an API route, update `backend/API.md` and the corresponding
  examples under `backend/http/`; add coverage for authorization and relevant error
  statuses. Keep the pull request checklist in
  [.github/pull_request_template.md](./pull_request_template.md) in sync with the
  change.
