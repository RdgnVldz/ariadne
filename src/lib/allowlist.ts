/** "a@x.com, B@x.com" becomes ["a@x.com", "b@x.com"] */
export function parseAllowedEmails(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * An allow list with "*" lets everyone in. An empty list lets everyone in
 * unless `closedWhenEmpty` is set, which production uses so that a
 * forgotten setting blocks sign-ups instead of opening them.
 */
export function isEmailAllowed(
  email: string,
  allowed: string[],
  closedWhenEmpty = false
): boolean {
  if (allowed.length === 0) return !closedWhenEmpty;
  if (allowed.includes("*")) return true;
  return allowed.includes(email.trim().toLowerCase());
}