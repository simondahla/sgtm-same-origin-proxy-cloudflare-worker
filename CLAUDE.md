# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Worker that acts as a same-origin proxy for server-side Google Tag Manager (SGTM). It enables client-side tracking to work around same-origin policy limitations when the GTM server container runs on a different domain.

**Core Functionality**: The worker accepts requests on your domain, strips a configured path prefix, and proxies them to your GTM server container while updating the Host header appropriately.

Example flow:
```
Client request:  https://api.yourdomain.com/gtm/gtm.js?id=GTM-XXXXX
Worker strips:   /gtm/gtm.js → /gtm.js
Proxies to:      https://your-gtm-server.com/gtm.js?id=GTM-XXXXX
```

## Development Commands

```bash
# Local development with hot reloading (starts local server at http://localhost:8787)
npm run dev

# Type checking (runs TypeScript compiler without emitting files)
npm run build

# Deploy to Cloudflare
npm run deploy
```

**First-time deployment**: Run `npx wrangler login` to authenticate with Cloudflare.

## Architecture

### Worker Implementation (src/index.ts)

The worker implements Cloudflare's `fetch` handler interface with a simple proxy pattern:

1. Extracts the pathname from incoming request URL
2. Strips the configured `PATH_PREFIX` (e.g., `/gtm/` → `/`)
3. Constructs target URL using `GTM_DOMAIN` environment variable
4. Creates new request with target URL, preserving original request properties
5. Updates `Host` header to match the target domain
6. Forwards request and returns response

**Critical detail**: The worker uses `request.url.replace(env.PATH_PREFIX, '/')` for path transformation, meaning the `PATH_PREFIX` must match the exact prefix in incoming URLs.

### Environment Variables

The worker requires two environment variables defined in the `Env` interface:

- `GTM_DOMAIN`: Target GTM server domain (no protocol, just domain)
- `PATH_PREFIX`: Path prefix to strip (must include leading and trailing slashes, e.g., `/gtm/`)

**Local development**: Configure in `.dev.vars` (gitignored)
**Production**: Configure in `wrangler.jsonc` under `vars` or in Cloudflare dashboard

### Configuration Files

- **wrangler.jsonc**: Defines worker name, main entry point, compatibility date, environment variables, and route configuration. Routes specify which domain patterns trigger this worker (pattern + zone_name).
- **tsconfig.json**: TypeScript configuration using ES2021 target with Cloudflare Workers types, strict mode enabled.

## Key Constraints

- Path prefix matching is exact string replacement, not regex-based
- All original request properties (method, headers, body) are preserved except the Host header
- No error handling is implemented - worker relies on Cloudflare and fetch API defaults
- Route configuration in `wrangler.jsonc` requires both `pattern` and `zone_name` to match your Cloudflare account's zones
