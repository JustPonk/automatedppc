# ⚠️ SUPABASE TEMPORALMENTE DESHABILITADO

Supabase ha sido deshabilitado temporalmente debido a restricciones de firewall.

## Archivos modificados:

1. **middleware.ts** - Middleware comentado, permite acceso sin autenticación
2. **Navigation.tsx** - Componentes de login/logout comentados

## ¿Qué está deshabilitado?

- ✅ La aplicación funciona normalmente
- ❌ Sistema de autenticación deshabilitado
- ❌ Protección de rutas deshabilitada
- ❌ Login/Logout no visible en navegación

## Para reactivar Supabase:

### Opción 1: Descomentar manualmente

1. **middleware.ts**:
   - Descomentar el `import` de `@supabase/ssr`
   - Descomentar todo el código dentro del bloque `/* COMENTADO TEMPORALMENTE ... */`
   - Eliminar el `return NextResponse.next();` que está al inicio

2. **Navigation.tsx**:
   - Descomentar todos los imports de Supabase
   - Descomentar el `useState` y `useEffect`
   - Descomentar la sección de UI con botones de login/logout

### Opción 2: Usar git (si tienes commits anteriores)

```bash
git checkout HEAD -- middleware.ts components/Navigation.tsx
```

### Opción 3: Restaurar desde los archivos de autenticación

Los archivos de autenticación siguen intactos en:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `components/auth/*`
- `app/auth/*`

Solo necesitas configurar las variables de entorno en `.env.local` y descomentar el código.

## Configuración necesaria para reactivar:

1. Crear proyecto en Supabase
2. Configurar `.env.local` con:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
   ```
3. Descomentar código en middleware.ts y Navigation.tsx
4. Reiniciar servidor: `npm run dev`

Ver [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para instrucciones completas.
