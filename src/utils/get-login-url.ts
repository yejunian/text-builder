export function getLoginUrl(nextPath?: string | null | undefined): string {
  return nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
}
