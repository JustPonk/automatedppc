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
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isPublic = ALLOWED_PUBLIC.some((p) => pathname.startsWith(p));

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
  }, [pathname, router, user]);

  if (!checked && !user && !ALLOWED_PUBLIC.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <>{children}</>;
}
