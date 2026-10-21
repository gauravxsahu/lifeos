import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Sun, Moon, Globe, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-700 to-emerald-600 dark:from-brand-400 dark:to-emerald-400 bg-clip-text text-transparent">
              LIFEOS
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2">
              Less Scrolling. More Living.
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 text-slate-500 mr-1.5 hidden sm:block" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 cursor-pointer font-medium"
              aria-label="Language selection"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Light / Dark mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User / Auth Buttons */}
          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold text-xs border border-brand-200 dark:border-brand-800">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden md:inline-block text-slate-700 dark:text-slate-300">
                  {user.displayName}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title={t.nav.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t.nav.signIn}
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition"
              >
                {t.nav.signUp}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
