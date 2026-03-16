import type { AuthUser } from "@/components/auth/AuthProvider";

export function allowedPathsFor(user: AuthUser | null): string[] | null {
  if (!user) return [];
  if (user.level === 10) return null; // full access
  if (user.level === 5) return ["/", "/kpis-data"]; // restricted to KPIs
  // default access set
  return ["/", "/pisco", "/malvinas", "/lima", "/kpis-data", "/operaciones"];
}

export function isPathAllowed(pathname: string, user: AuthUser | null): boolean {
  const allowed = allowedPathsFor(user);
  if (allowed === null) return true;
  return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
