// Common fixture API adapter: answers the app's own `fetch("/api/...")` calls
// in the browser so components run unchanged with no keys, DB, GPU or PG.
export type FixtureReply = { status?: number; json: unknown };
export type FixtureRoute = (req: {
  method: string;
  body: unknown;
  call: number;
}) => FixtureReply;
export type FixtureRoutes = Record<string, FixtureRoute>; // key: "METHOD path"

export const calls: { key: string; body: unknown }[] = [];

export function installFixtureApi(routes: FixtureRoutes) {
  const counts: Record<string, number> = {};
  const real = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = new URL(String(input instanceof Request ? input.url : input), location.href);
    if (!url.pathname.startsWith("/api/")) return real(input, init);
    const method = (init?.method ?? "GET").toUpperCase();
    const key = `${method} ${url.pathname.slice(5)}`;
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
    calls.push({ key, body });
    const route = routes[key];
    counts[key] = (counts[key] ?? 0) + 1;
    // Unknown routes fail loudly so a fixture never silently "passes".
    const reply = route
      ? route({ method, body, call: counts[key] })
      : { status: 404, json: { code: "FIXTURE_ROUTE_MISSING", error: key } };
    return new Response(JSON.stringify(reply.json), {
      status: reply.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  (window as unknown as { __fixtureCalls: typeof calls }).__fixtureCalls = calls;
}
