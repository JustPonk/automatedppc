"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { isPathAllowed } from "@/lib/auth/permissions";

const ALLOWED_PUBLIC = [
  "/auth/login",
  "/auth/register",
  "/auth/callback"
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    const isPublic = ALLOWED_PUBLIC.some((p) => pathname.startsWith(p));

    // Bloqueo de seguridad: Solo permitir usuario "jeff"
    if (user && user.email !== "jeff") {
      logout();
      router.replace("/auth/login");
      return;
    }

    if (!user && !isPublic) {
      router.replace("/auth/login");
      return;
    }

    // If logged in but route not allowed for this level, send to home
    if (user && !isPathAllowed(pathname, user)) {
      router.replace("/");
      return;
    }

    setChecked(true);
  }, [hydrated, pathname, router, user]);

  if (!hydrated) {
    return null;
  }

  if (!checked && !user && !ALLOWED_PUBLIC.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <>{children}</>;
}
