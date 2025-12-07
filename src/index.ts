/**
 * Cloudflare Worker for same-origin access to server-side Google Tag Manager
 *
 * This worker proxies requests to a GTM server container, enabling same-origin
 * tracking while the GTM server runs on a different domain.
 */

interface Env {
  GTM_DOMAIN: string;
  PATH_PREFIX: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Strip the configured path prefix from the incoming request
    // e.g., /xyz/gtm.js -> /gtm.js
    const pathname = url.pathname.replace(env.PATH_PREFIX, '/');

    // Construct the proxied URL using the configured GTM domain
    const targetUrl = `https://${env.GTM_DOMAIN}${pathname}${url.search}`;

    // Create a new request with the target URL
    const proxyRequest = new Request(targetUrl, request);

    // Update the Host header to match the target domain
    proxyRequest.headers.set('Host', env.GTM_DOMAIN);

    // Forward the request to the GTM server
    return fetch(proxyRequest);
  },
};
