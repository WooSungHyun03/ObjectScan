// This value is embedded in the client build and read by server finance guards.
export function educationMode() {
  return process.env.NEXT_PUBLIC_PROJECT_PURPOSE === "education";
}
