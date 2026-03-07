import Link from "next/link";

export default function PiscoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-blue-950 pt-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏭</div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Pisco Operations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Herramientas de procesamiento automatizado para PEPIS
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Pisco Automated */}
          <Link
            href="/pisco/automate"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">⚙️</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Pisco Automated
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Procesamiento automático de archivos de accesos PEPIS PV1
            </p>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
              Abrir herramienta
              <span className="text-lg">→</span>
            </div>
            
            {/* Features badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                Excel Processing
              </span>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                Auto Filter
              </span>
              <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                Drag & Drop
              </span>
            </div>
          </Link>

          {/* Placeholder for future tools */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📊</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Reportes
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generación de reportes automáticos
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-500">Próximamente</span>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700 opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📈</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Analytics
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Análisis de datos de accesos
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-500">Próximamente</span>
          </div>
        </div>
      </main>
    </div>
  );
}
