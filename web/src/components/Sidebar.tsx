import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  CheckSquare,
  Smartphone,
  BookOpen,
  Timer,
  Settings,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const links = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/goals', label: t.nav.goals, icon: CheckSquare },
    { to: '/apps', label: t.nav.apps, icon: Smartphone },
    { to: '/stories', label: t.nav.stories, icon: BookOpen },
    { to: '/focus', label: t.nav.focus, icon: Timer },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Wellness Quote Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Digital Intentionality
        </p>
        <p className="leading-relaxed">
          "Attention is the rarest and purest form of generosity." — Simone Weil
        </p>
      </div>
    </aside>
  );
};
