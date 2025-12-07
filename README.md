# SGTM Same-Origin Proxy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/simondahla/sgtm-same-origin-cloudflare-worker)

A Cloudflare Worker that proxies requests to server-side Google Tag Manager (SGTM), enabling same-origin tracking while your GTM server runs on a different domain.

## Purpose

This worker solves the same-origin policy limitation for server-side GTM tracking by:
- Accepting requests on your domain (e.g., `api.yourdomain.com`)
- Stripping a configured path prefix (e.g., `/gtm/`)
- Proxying requests to your GTM server container
- Updating headers appropriately

This allows client-side code to make requests to `api.yourdomain.com/gtm/gtm.js` which gets proxied to `your-gtm-server.com/gtm.js`, avoiding CORS issues.

## Setup

### Prerequisites

- Node.js 18+ installed
- A Cloudflare account
- A GTM server container URL

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables for local development:
   ```bash
   cp .dev.vars.example .dev.vars
   ```

4. Edit `.dev.vars` with your actual values:
   ```
   GTM_DOMAIN=your-gtm-server.com
   PATH_PREFIX=/gtm/
   ```

## Configuration

### Environment Variables

The worker requires two environment variables:

- `GTM_DOMAIN` - The domain of your GTM server container (e.g., `your-gtm-server.com`)
- `PATH_PREFIX` - The path prefix to strip from incoming requests (e.g., `/gtm/`)

### Local Development

Configure these in `.dev.vars` (gitignored):

```
GTM_DOMAIN=your-gtm-server.com
PATH_PREFIX=/gtm/
```

### Production Deployment

Configure these in the Cloudflare dashboard under your worker's settings, or in [wrangler.jsonc](wrangler.jsonc).

### Route Configuration

Update the route in [wrangler.jsonc](wrangler.jsonc) to match your domain:

```jsonc
"routes": [
  {
    "pattern": "api.yourdomain.com/*",
    "zone_name": "yourdomain.com"
  }
]
```

## Development

Run the worker locally with hot reloading:

```bash
npm run dev
```

This starts a local development server, typically at `http://localhost:8787`.

### Type Checking

Run TypeScript type checking:

```bash
npm run build
```

## Deployment

Deploy to Cloudflare:

```bash
npm run deploy
```

**Note**: On first deployment, you may need to:
1. Authenticate with Wrangler: `npx wrangler login`
2. Configure routes in the Cloudflare dashboard if not using `wrangler.jsonc` routes

## Usage Example

Once deployed, requests to your domain are proxied to GTM:

```
Request:  https://api.yourdomain.com/gtm/gtm.js?id=GTM-XXXXX
Proxied:  https://your-gtm-server.com/gtm.js?id=GTM-XXXXX
```

In your client-side code:

```html
<script src="https://api.yourdomain.com/gtm/gtm.js?id=GTM-XXXXX"></script>
```

## How It Works

1. Request comes in: `api.yourdomain.com/gtm/collect?payload=...`
2. Worker strips prefix: `/gtm/collect` → `/collect`
3. Worker builds target URL: `https://your-gtm-server.com/collect?payload=...`
4. Worker updates Host header and forwards request
5. GTM server response is returned to client

## Project Structure

```
sgtm-same-origin-cloudflare-worker/
├── src/
│   └── index.ts          # Worker implementation
├── .dev.vars.example     # Example environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── wrangler.jsonc       # Cloudflare Worker configuration
└── README.md           # This file
```

## License

MIT
