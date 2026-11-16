// Test-only stand-in for @/lib/supabase/client: scripted auth results, no project URL/key.
type AuthError = { code?: string; name?: string; message: string };
type AuthResult = { data?: unknown; error: AuthError | null };
export type AuthFixture = Record<string, (args: unknown) => AuthResult>;

let current: AuthFixture = {};
export const authCalls: { method: string; args: unknown }[] = [];
export function setAuthFixture(f: AuthFixture) {
  current = f;
  (window as unknown as { __authCalls: typeof authCalls }).__authCalls =
    authCalls;
}

export function browserClient() {
  const auth = new Proxy(
    {},
    {
      get:
        (_, method: string) =>
        async (args: unknown): Promise<AuthResult> => {
          authCalls.push({ method, args });
          const fn = current[method];
          // Unscripted calls fail loudly so a fixture never silently "passes".
          return fn
            ? fn(args)
            : {
                data: null,
                error: {
                  code: "FIXTURE_ROUTE_MISSING",
                  message: `auth.${method}`,
                },
              };
        },
    },
  );
  return { auth } as unknown as ReturnType<
    typeof import("@supabase/ssr").createBrowserClient
  >;
}
