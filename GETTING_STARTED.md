# Getting started

## 1. Requirements

Install Node.js 22 or newer, Corepack, pnpm, Docker Engine or Docker Desktop with
Compose v2, and Git.

## 2. Create the environment

`start.sh` performs this automatically. To edit the environment before the first
start, create it manually:

```bash
cp .env.example .env
```

Development works with the committed local defaults. Optional external
integrations stay disabled until their variables are supplied.

For production, set:

- `APP_DOMAIN`
- `POSTGRES_PASSWORD`
- `BETTER_AUTH_SECRET`
- `SEARCH_ENGINE_MASTER_KEY`

To expose the stack automatically through Cloudflare, also set
`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.

You do not need to duplicate the domain into public frontend URLs, Better Auth,
CORS, Stripe redirects, or tunnel settings.

## 3. Start development

Fresh clone:

```bash
./start.sh
```

`sh start.sh` and `bash start.sh` are also supported. After the initial setup,
use `pnpm dev:up` and `pnpm dev:down` for normal starts and stops.

Source changes reload automatically. Use `pnpm dev:rebuild` after changing a
package dependency, lockfile, Dockerfile, or other image-level configuration.

Available endpoints:

- Application: <http://localhost>
- Frontend: <http://localhost:3000>
- API health: <http://localhost/api/health>
- Authentication API: <http://localhost/api/auth>
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Meilisearch: <http://localhost:7700/health>
- ClamAV: `localhost:3310`

Each cloned folder receives independent development and production Compose
project names. Override the `DEV_*_PORT` values in `.env` only when you want to
run multiple clones on the same host at once.

## 4. Start production

Without a public tunnel:

```bash
pnpm prod:up
```

With automatic Cloudflare Tunnel and DNS:

```bash
pnpm prod:tunnel:up
```

Production validates the environment before serving traffic. Placeholder
secrets and partially configured integrations are rejected with a specific
startup error.

## 5. Build the product

Add product UI under `frontend/src`, NestJS feature modules under
`backend/src`, and shared Zod contracts under `shared/src`.

For a new table:

1. Edit `backend/src/database/database.schema.ts`.
2. Run `pnpm db:generate`.
3. Review the generated SQL.
4. Restart the backend; committed migrations apply automatically.

The existing database migration contains only generic account and session
tables.

## 6. External provider setup

Environment variables remove application-side configuration, but third-party
services still require their own one-time setup:

- Cloudflare: the domain must be an active zone and the API token needs Tunnel
  Edit, Zone Read, and DNS Edit.
- OAuth providers: register `https://APP_DOMAIN/api/auth/callback/PROVIDER`.
- Stripe: register `https://APP_DOMAIN/api/payments/webhooks/stripe`.
- SES: verify the sender/domain and leave the sandbox when required.
- R2/S3: create the bucket and configure its public URL.

After those provider-side steps, application work stays in the three workspace
packages; no proxy, Docker, auth, or deployment wiring should be necessary.

Stripe webhook signatures are already validated, but the starter cannot know
your product's fulfillment or subscription rules. Add those business effects to
`PaymentService.handleWebhookEvent` when implementing payments.
