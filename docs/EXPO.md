# Expo app

`apps/expo-app` is an Expo SDK 57 React Native client for iOS, Android, and web.
It uses the same backend and Better Auth accounts as the Next.js web app. Its
screen is a clean email sign-in/registration starting point; product screens
belong in `apps/expo-app`. Electron packages the Next.js UI for desktop.

After `./start.sh`, set these values in the root `.env`:

```dotenv
EXPO_AUTH_ENABLED=true
EXPO_API_URL=https://your-reachable-domain.example/api
```

The API URL must be reachable from the device. A physical phone cannot reach
your Mac through `localhost`. Use a public HTTPS endpoint or a development
tunnel. The backend enables the Expo auth plugin and trusts the app's custom
scheme when `EXPO_AUTH_ENABLED=true`; restart the backend after changing it.
`EXPO_APP_SCHEME` defaults to `APP_ID`. Set `EXPO_BUNDLE_ID` to your unique
reverse-DNS package ID before publishing. Set `EXPO_WEB_ORIGIN` to the exact
HTTPS origin where you publish the Expo web build; local development trusts
`http://localhost:8081` when Expo auth is enabled. The Expo web app and the
Next.js web app are independent interfaces.

```bash
pnpm expo:dev
pnpm expo:check
pnpm expo:export
```

To use hosted native builds, set `EXPO_PROJECT_ID` to the EAS project ID and
authenticate with your Expo account. `apps/expo-app/eas.json` defines internal
preview and production profiles. Then run `pnpm expo:android` or
`pnpm expo:ios`. The wrapper exports an explicit public allowlist from `.env` into
`apps/expo-app/.generated/public-env.json` before invoking EAS. `.easignore`
includes that snapshot while excluding `.env`, credentials, host-agent state,
and build outputs. Cloud app configuration loads the snapshot; EAS environment
values can override it. `pnpm expo:prepare` validates this step without
submitting a build. EAS handles the remote build and prompts for signing setup.
Run the wrapper again after changing `.env`; do not invoke `eas build` directly
with a stale snapshot.

`pnpm expo:dev` starts Metro. Startup and export commands clear its cache so
changes to the public environment are not masked by an older bundle. Use its prompts to open an installed simulator,
Android emulator, or browser. Expo Go may not support every native capability;
use an Expo development build when needed. The generated app identity and
public API URL come from the clone's environment. Only public values are
embedded in the app. Never put backend secrets in Expo public config.

For store builds, connect your own Expo account, register the app with EAS,
configure platform signing, and build for iOS or Android. These are
product-specific credentials and cannot be prefilled by a cloneable template.
Expo does not produce macOS, Windows, or Linux desktop installers. The web
target can be hosted as a website.

Sources: [Expo monorepos](https://docs.expo.dev/guides/monorepos/),
[EAS Build](https://docs.expo.dev/build/introduction/), and
[Better Auth Expo integration](https://better-auth.com/docs/integrations/expo).

## Optional CAPTCHA

When both Turnstile keys are configured, the app reads the API's public config
and opens `/native/challenge` on the web app before email sign-in or signup.
The hosted widget returns a token to the exact configured Expo scheme or web
origin. Random state and exact callback validation bind it to the initiating
request; the backend's existing CAPTCHA plugin performs server verification.
Cancellation allows a fresh attempt. Passwords and session tokens never go
through this redirect. Use a development build with the configured scheme for
native testing; Expo Go does not own your app's custom scheme.

Configure Turnstile for the hosted Next.js domain and deploy the web app with
its public site key. For Expo web, set `EXPO_WEB_ORIGIN` to its exact origin.
Web popup authentication requires HTTPS or localhost and a user click.
See [Expo browser authentication](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
and [Turnstile verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
