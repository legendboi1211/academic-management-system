'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Timer, Target, Calendar, Beaker, FileText, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Timer', href: '/timer', icon: Timer },
    { name: 'Analytics', href: '/graph', icon: BarChart3 },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth');
  };

  // Hide navbar on auth page
  if (pathname === '/auth' || !user) {
    return null;
  }

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit max-w-[calc(100vw-2rem)]">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-1 flex-wrap justify-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-500 ease-out ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-1' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={isActive ? 'block' : 'hidden lg:block'}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-500 ease-out disabled:opacity-50"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </nav>
  );
}
