"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth/AuthProvider';
import { allowedPathsFor } from '@/lib/auth/permissions';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const baseMenu = [
    { name: 'Pisco', path: '/pisco', color: 'from-blue-500 to-blue-600' },
    { name: 'Malvinas', path: '/malvinas', color: 'from-purple-500 to-purple-600' },
    { name: 'Lima', path: '/lima', color: 'from-green-500 to-green-600' },
    { name: 'KPIS data', path: '/kpis-data', color: 'from-amber-500 to-orange-500' },
    { name: 'Operaciones', path: '/operaciones', color: 'from-indigo-500 to-blue-600' }
  ];

  const level10Extra = [
    { name: 'Tesis', path: '/tesis', color: 'from-rose-500 to-pink-500' }
  ];

  const allowed = allowedPathsFor(user);
  const menu = user?.level === 10 ? [...baseMenu, ...level10Extra] : baseMenu;

  if (pathname === '/') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Automated Data
          </Link>
          
          <div className="flex items-center gap-4">
            {menu.map((item) => {
              const isAllowed = allowed === null || allowed.some((p) => item.path === p || item.path.startsWith(`${p}/`));
              return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${pathname.startsWith(item.path)
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${!isAllowed ? 'opacity-50 pointer-events-none' : ''}
                `}
              >
                {item.name}
              </Link>
            );
            })}

            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email} · Nivel {user.level}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-4 pl-4 border-l border-gray-300 dark:border-gray-700 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
