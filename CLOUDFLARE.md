# Publish Oracle Grove at oraclegrove.study

The domain stays registered with GoDaddy. Cloudflare runs the app and its API routes.

## Connect the repository

In Cloudflare Workers & Pages, create a Worker from the GitHub repository `Santhosh642003/OracleGrove`.

- Worker name: `oracle-grove`
- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy --config dist/server/wrangler.json`
- Node version: 22 or later

The standalone build omits the Sites authentication and connector adapters. It reuses the same app, assets, and API handlers.

## Add runtime secrets

In the Worker's Settings → Variables and Secrets, add encrypted secrets named `GEMINI_API_KEY` and `ELEVENLABS_API_KEY`. Do not add these as public build variables. Optional variable: `GEMINI_MODEL=gemini-3.8-flash`.

Redeploy after saving secrets. Check the Worker URL with a synthetic question and narration before connecting the domain.

## Connect the domain

Add `oraclegrove.study` as a domain/zone in Cloudflare. Review the imported DNS records, preserving mail records and any other existing services. Cloudflare will assign two account-specific nameservers.

In GoDaddy's domain settings, replace the domain's nameservers with the exact pair Cloudflare provides. Wait for Cloudflare to show the zone as active. Do not guess nameserver values.

In the Worker's Settings → Domains & Routes, add the custom domain `oraclegrove.study`. Cloudflare provisions DNS and HTTPS for the Worker. An existing conflicting website record must be reviewed before replacing it.

Domain registration stays with GoDaddy; DNS management moves to Cloudflare. No domain purchase or transfer is needed.
