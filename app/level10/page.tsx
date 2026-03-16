"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function Level10Page() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.level !== 10) {
      router.replace("/auth/login");
    }
  }, [router, user]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="relative h-screen w-full overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80"
        >
          <source src="https://cdn.coverr.co/videos/coverr-horizon-lights-5466/1080p.mp4" type="video/mp4" />
          <source src="https://cdn.coverr.co/videos/coverr-horizon-lights-5466/720p.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Nivel 10</p>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Panel avanzado
            <br />
            Operaciones y Tesis
          </h1>
          <p className="max-w-2xl text-lg text-gray-200">
            Fondo con video usando etiqueta video, autoplay, muted, loop y object-cover para cubrir el hero completo. Puedes reemplazar la URL por tu MP4 en public/hero.mp4 y actualizar el src.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/tesis"
              className="rounded-full bg-white px-5 py-3 text-gray-900 font-semibold hover:bg-amber-200 transition-colors"
            >
              Ir a Tesis
            </Link>
            <Link
              href="/operaciones"
              className="rounded-full border border-white/70 px-5 py-3 font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Ver Operaciones
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gray-900/70 border-t border-white/10 py-12 px-6">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <p className="text-sm text-amber-200 mb-2">Hero video tip</p>
            <p className="text-gray-200 text-sm">
              Coloca tu archivo en public/hero.mp4 y cambia el src. Usa <code>object-cover</code> para que siempre llene el viewport sin distorsión.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <p className="text-sm text-amber-200 mb-2">Performance</p>
            <p className="text-gray-200 text-sm">
              Incluye un poster (imagen) para evitar pantalla negra mientras carga el video. Activa <code>playsInline</code> para iOS.
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
            <p className="text-sm text-amber-200 mb-2">Acceso</p>
            <p className="text-gray-200 text-sm">
              Esta página fuerza redirect al login si el usuario no es nivel 10. Control básico en cliente mientras Supabase está pendiente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
