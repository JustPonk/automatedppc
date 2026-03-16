"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TesisPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    }
  }, [router, user]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Tesis</h1>
        <p className="text-gray-700 dark:text-gray-300">Contenido reservado para usuarios autenticados. (Placeholder)</p>
      </div>
    </div>
  );
}
