import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Clock,
  ArrowRight,
  Target,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Digital Wellness & Habit Companion</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Less Scrolling.{' '}
            <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
              More Living.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            LIFEOS isn’t a restrictive screen-time locker. It is an empathetic AI friend that understands your career goals, notices when you get lost scrolling, and inspires you to take small, meaningful steps.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base shadow-lg shadow-brand-500/25 transition duration-150"
            >
              <span>Start Free with LIFEOS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-base hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150"
            >
              Sign In to Your Dashboard
            </Link>
          </div>

          {/* Social Proof & Guarantees */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero Shame & Zero Manipulative Guilt</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Grounded, Fact-Checked Motivation</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Android UsageStats Local Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Built for Real Humans, Not Productivity Robots
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              We replace cold screen-blockers with supportive mentorship, realistic micro-actions, and honest historical inspiration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Smart App Monitoring
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Configure individual thresholds for Instagram, YouTube, and X. Monitors foreground duration locally on Android without transmitting private screen content.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Daily Goal Rescue
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                When you reach an app limit, LIFEOS connects you to your pending goals with a bite-sized, 20-minute action. Progress over perfection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Verified Motivational Stories
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                No fake quotes or AI hallucinations. Verified historical case studies from pioneers like Steve Wozniak, Linus Torvalds, and Satya Nadella with complete bibliography.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 LIFEOS Platform. Built for digital wellness and human intentionality.</p>
        <p className="mt-1">Less Scrolling. More Living.</p>
      </footer>
    </div>
  );
};
