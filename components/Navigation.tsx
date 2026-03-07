'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const menuItems = [
    { name: 'Pisco', path: '/pisco', color: 'from-blue-500 to-blue-600' },
    { name: 'Malvinas', path: '/malvinas', color: 'from-purple-500 to-purple-600' },
    { name: 'Lima', path: '/lima', color: 'from-green-500 to-green-600' }
  ];

  if (pathname === '/') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Jeff Automates
          </Link>
          
          <div className="flex gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${pathname.startsWith(item.path)
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
