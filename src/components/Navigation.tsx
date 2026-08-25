'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListTodo, Flame, BookOpen, BookMarked, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Acasă', icon: Home },
  { path: '/tasks', label: 'Task-uri', icon: ListTodo },
  { path: '/focus', label: 'Focus', icon: Flame },
  { path: '/journal', label: 'Jurnal', icon: BookOpen },
  { path: '/resources', label: 'Ghiduri', icon: BookMarked },
  { path: '/settings', label: 'Setări', icon: Settings }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#EBE7DF] dark:bg-stone-900 dark:border-stone-850 h-screen fixed left-0 top-0 p-6 z-20">
        <div className="mb-8">
          <h1 className="text-sm font-extrabold text-[#4A7C59] tracking-wider uppercase">Focusly 🌿</h1>
          <p className="text-[9px] text-stone-500 font-bold mt-0.5">Fără presiune, doar progres</p>
        </div>

        <nav className="flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-[#4A7C59] dark:bg-emerald-950/20'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-850'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#EBE7DF] dark:bg-stone-900 dark:border-stone-850 flex items-center justify-around z-20 pb-safe shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[9px] font-bold transition-all ${
                isActive ? 'text-[#4A7C59]' : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <Icon size={16} />
              <span className="mt-1 text-[8px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
