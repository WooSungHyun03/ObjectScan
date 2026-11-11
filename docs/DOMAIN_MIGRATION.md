# Domain migration — read-only discovery

2026-11-11: be-celeb.org returns HTTPS200 existing service; www returns307 to apex. Cloudflare NS buck/ligia; Cloudflare email routing MX and SPF exist. www currently CNAME8533f02441d85400.vercel-dns-017.com. Preserve every existing record. No domain add/reassignment or DNS changes.

Before switch: inspect Vercel domains read-only, export complete zone with TTL/proxy/MX/TXT, identify old project/deployment, obtain explicit replacement approval. Verify isolated Preview first. Intended canonical apex, www308 redirect; configure Supabase allowlist/callback, APP_URL/canonical/sitemap, CSP/CORS and Toss callbacks for exact origin. Do not infer target DNS; use actual domains inspect recommendations after approved association.

Rollback: restore recorded original A/AAAA/CNAME/TTL/proxy and old project association, preserve MX/TXT; verify apex/www HTTPS, email records, original service and Auth redirects. Until approval ObjectScan remains on separate Vercel URLs.
