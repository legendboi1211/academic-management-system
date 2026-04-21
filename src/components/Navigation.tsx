'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Timer, Target, Calendar, Beaker, FileText, BarChart3 } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Timer', href: '/timer', icon: Timer },
    { name: 'Analytics', href: '/graph', icon: BarChart3 },
    { name: 'Notes', href: '/notes', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-fit">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-2 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-1">
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
      </div>
    </nav>
  );
}
