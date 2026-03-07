import Link from "next/link";

export default function Home() {
  const locations = [
    {
      name: "Pisco",
      description: "Procesamiento automatizado de accesos PEPIS PV1",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      icon: "🏭",
      path: "/pisco"
    },
    {
      name: "Malvinas",
      description: "Procesamiento de datos Malvinas (Próximamente)",
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      icon: "⚡",
      path: "/malvinas"
    },
    {
      name: "Lima",
      description: "Procesamiento de datos Lima (Próximamente)",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      icon: "🌆",
      path: "/lima"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        {/* Welcome Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            Jeff Automates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Plataforma automatizada de procesamiento de archivos Excel para operaciones
          </p>
        </div>

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {locations.map((location) => (
            <Link
              key={location.name}
              href={location.path}
              className={`
                relative group
                bg-white dark:bg-gray-800 rounded-2xl shadow-xl
                p-8 transition-all duration-300
                hover:shadow-2xl hover:-translate-y-2
                border border-gray-200 dark:border-gray-700
              `}
            >
              {/* Icon */}
              <div className="text-6xl mb-4">{location.icon}</div>
              
              {/* Title */}
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {location.name}
              </h2>
              
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {location.description}
              </p>
              
              {/* Button */}
              <div className={`
                inline-flex items-center gap-2 px-6 py-3 rounded-lg
                bg-gradient-to-r ${location.color} ${location.hoverColor}
                text-white font-medium
                transition-all duration-300
                group-hover:gap-4
              `}>
                Acceder
                <span className="text-xl">→</span>
              </div>

              {/* Decorative gradient */}
              <div className={`
                absolute top-0 right-0 w-32 h-32 
                bg-gradient-to-br ${location.color}
                opacity-10 rounded-2xl
                group-hover:opacity-20 transition-opacity
              `} />
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-gray-500 dark:text-gray-500">
          <p className="text-sm">
            Selecciona una ubicación para comenzar a procesar tus archivos
          </p>
        </div>
      </main>
    </div>
  );
}
