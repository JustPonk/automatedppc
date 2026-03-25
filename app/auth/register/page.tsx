import Link from 'next/link';

// Icono SVG inline para no depender de librerías externas
function ServerOffIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M7 2h13a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5" />
      <path d="M10 10 2.5 2.5C2 2 2 2.5 2 5v3a2 2 0 0 0 2 2h6z" />
      <path d="M22 17v-1a2 2 0 0 0-2-2h-1" />
      <path d="M4 14a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16.5l1-1" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4 10v4" />
      <path d="M20 10v4" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 border border-red-100 dark:border-red-900">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
            <ServerOffIcon className="w-16 h-16 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Página en Mantenimiento
          </h1>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-red-600 dark:text-red-400">
              Servicio Temporalmente Suspendido
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Se venció el período de hosting gratuito de 30 días. Por favor, contacte al administrador del sistema para renovar el servicio.
            </p>
          </div>

          <div className="w-full pt-6 border-t border-gray-100 dark:border-gray-700">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Volver al Inicio de Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
