# Guía de Configuración de Supabase

## Paso 1: Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Espera a que el proyecto termine de configurarse

## Paso 2: Obtener las credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL** (URL)
   - **anon/public key** (API Key)

## Paso 3: Configurar variables de entorno

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key-aqui
```

## Paso 4: Configurar autenticación en Supabase

1. Ve a **Authentication** → **Providers** en tu panel de Supabase
2. Habilita **Email** como proveedor de autenticación
3. Configura las URLs de redirección:
   - **Site URL**: `http://localhost:3000` (para desarrollo)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `https://tu-dominio.com/auth/callback` (para producción)

## Paso 5: (Opcional) Configurar plantillas de email

1. Ve a **Authentication** → **Email Templates**
2. Personaliza las plantillas de confirmación de email y recuperación de contraseña

## Paso 6: Iniciar el servidor de desarrollo

```bash
npm run dev
```

## Rutas disponibles

- `/auth/login` - Página de inicio de sesión
- `/auth/register` - Página de registro
- `/pisco` - Página protegida: Pisco Automated
- `/lima` - Página protegida: Lima
- `/malvinas` - Página protegida: Malvinas

## Protección de rutas

El middleware automáticamente protege las rutas `/pisco`, `/lima` y `/malvinas`. Si un usuario no autenticado intenta acceder, será redirigido a `/auth/login`.

## Personalización

Para proteger rutas adicionales, edita el archivo `middleware.ts`:

```typescript
const protectedRoutes = ['/pisco', '/lima', '/malvinas', '/tu-nueva-ruta'];
```

## Troubleshooting

### Error: "Invalid API key"
- Verifica que copiaste correctamente las credenciales de Supabase
- Asegúrate de usar la **anon/public key**, no la service_role key

### Error: "Email not confirmed"
- Revisa tu bandeja de entrada para confirmar el email
- En desarrollo, puedes desactivar la confirmación de email en Supabase:
  - Ve a **Authentication** → **Settings**
  - Desactiva "Enable email confirmations"

### No puedo acceder después de hacer login
- Verifica que el middleware esté configurado correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que las URLs de redirección estén configuradas en Supabase
