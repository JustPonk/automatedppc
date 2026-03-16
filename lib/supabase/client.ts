import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // SUPABASE TEMPORALMENTE DESHABILITADO
  // Retornar un cliente mock si no hay credenciales configuradas
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'your_supabase_project_url' || key === 'your_supabase_anon_key') {
    // Retornar un cliente mock que no hace nada
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase no configurado') }),
        signUp: async () => ({ data: null, error: new Error('Supabase no configurado') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      }
    } as any;
  }

  return createBrowserClient(url, key);
}
