# Fullstack Starter

A batteries-included TypeScript platform base. Configure one environment file, start
the stack, and keep product work inside the frontend, backend, and shared packages.

## Included

- Next.js frontend and NestJS API
- PostgreSQL with Drizzle migrations
- Better Auth with email/password and automatically detected social providers
- Redis caching, rate limiting, BullMQ queues, and Socket.IO scaling
- Optional Stripe payments, AWS SES email, R2/S3 uploads, and Turnstile
- Meilisearch and ClamAV
- Nginx, health checks, hardened production containers, and Cloudflare Tunnel
- Automatic Cloudflare tunnel, ingress, token, and DNS provisioning

## Development

For a fresh clone, run:

```bash
./start.sh
```

The script creates `.env` from `.env.example` when needed, performs a frozen
install, and starts development. You can also run those three steps manually.
Open <http://localhost>. The stack starts the applications and all core local
services, then applies committed database migrations automatically.

Normal source changes reload automatically. After changing dependencies,
Dockerfiles, or other image-level configuration, rebuild with:

```bash
pnpm dev:rebuild
```

Stop it with:

```bash
pnpm dev:down
```

Compose project names are derived from the cloned directory and environment, so
different clones do not share containers or data volumes. If another project is
already using a host port, change the corresponding `DEV_*_PORT` value in
`.env`.

## Production with a domain

Set these values in `.env`:

```dotenv
APP_DOMAIN=example.com
POSTGRES_PASSWORD=a-unique-password-of-at-least-16-characters
BETTER_AUTH_SECRET=a-long-random-secret-of-at-least-32-characters
SEARCH_ENGINE_MASTER_KEY=a-unique-search-key-of-at-least-16-characters
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

Generate the auth secret with `openssl rand -base64 48`. The Cloudflare token
needs Tunnel Edit, Zone Read, and DNS Edit access for the account and zone.

Then run:

```bash
pnpm prod:tunnel:up
```

That command builds the production applications, starts the data services and
Nginx, creates or reuses a Cloudflare tunnel, configures its ingress, writes the
runtime token, and creates the proxied DNS record. The domain is reused
automatically by frontend metadata, auth URLs, trusted origins, CORS, Stripe
return URLs, and the tunnel.

Production startup fails early when core secrets are missing, use starter
values, or when an optional integration is only partially configured.

## Optional integrations

Only add the corresponding environment values:

- Social login: provider client ID and client secret
- Stripe: secret key, webhook secret, and allowed price IDs
- Turnstile: site key and secret key
- SES: AWS credentials and sender address
- R2/S3: endpoint, credentials, bucket, and public URL

The frontend discovers configured social providers from the API; there is no
separate provider list to maintain. Integrations with no credentials remain
inactive and do not prevent development startup.

When Turnstile is configured, Better Auth verifies its token for email signup,
email login, and password-reset requests. The Stripe foundation creates Checkout
Sessions and verifies webhook signatures; implement product-specific webhook
effects in `PaymentService.handleWebhookEvent`. `SearchService.getIndex()`
provides typed access to Meilisearch indexes.

External providers still require their unavoidable one-time account setup, such
as OAuth callback URLs, a Stripe webhook endpoint, SES sender verification, or
an R2 bucket. No additional proxy, Docker, auth, or deployment wiring is
required; product-specific behavior remains application code.

## Workspace

- `frontend/src/app`: routes and product UI
- `frontend/src/components`: reusable UI and account screens
- `backend/src`: infrastructure and NestJS feature modules
- `backend/src/database/database.schema.ts`: product database schema
- `shared/src`: validated cross-package contracts
- `infrastructure`: automatic Cloudflare provisioning
- `proxy`: Nginx routing for web, API, auth, and WebSockets

Useful checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm format:check
pnpm audit --prod
```

GitHub Actions runs the same checks on pushes and pull requests, and Dependabot
tracks package, container, and workflow updates.

See [GETTING_STARTED.md](./GETTING_STARTED.md) for the environment workflow and
[CLOUDFLARE_TUNNEL.md](./CLOUDFLARE_TUNNEL.md) for token permissions and DNS
behavior.
