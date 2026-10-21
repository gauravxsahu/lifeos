import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Smartphone,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  BookOpen,
  CheckCircle2,
  Bell,
} from 'lucide-react';

export const AppsPage: React.FC = () => {
  const { t } = useLanguage();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newApp, setNewApp] = useState({
    packageName: 'com.reddit.frontpage',
    displayName: 'Reddit',
    dailyLimitMinutes: 45,
  });

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      const res = await api.getApps();
      setApps(res.apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createApp(newApp);
      setShowAddModal(false);
      loadApps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Remove this app from monitoring?')) return;
    try {
      await api.deleteApp(appId);
      loadApps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleThresholdVoice = async (threshold: any) => {
    try {
      await api.updateThreshold(threshold.id, {
        voiceEnabled: !threshold.voiceEnabled,
        reminderMode: !threshold.voiceEnabled ? 'VOICE_AND_TEXT' : 'TEXT_ONLY',
      });
      loadApps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.apps.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.apps.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.apps.addApp}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
                  {app.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {app.displayName}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    {app.packageName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteApp(app.id)}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Remove monitoring"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">{t.apps.dailyLimit}:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {app.dailyLimitMinutes} minutes / day
              </span>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5" />
                <span>{t.apps.thresholds}</span>
              </div>
              <div className="space-y-2">
                {app.thresholds.map((th: any) => (
                  <div
                    key={th.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {th.thresholdMinutes}m:
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                        {th.reminderMode.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleThresholdVoice(th)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                          th.voiceEnabled
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Toggle voice speech for this reminder"
                      >
                        {th.voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{th.voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add App Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.apps.addApp}
            </h3>

            <form onSubmit={handleCreateApp} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reddit, X, Twitter"
                  value={newApp.displayName}
                  onChange={(e) => setNewApp({ ...newApp, displayName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Android Package Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. com.reddit.frontpage"
                  value={newApp.packageName}
                  onChange={(e) => setNewApp({ ...newApp, packageName: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Limit (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="720"
                  value={newApp.dailyLimitMinutes}
                  onChange={(e) => setNewApp({ ...newApp, dailyLimitMinutes: parseInt(e.target.value, 10) || 60 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                >
                  Add Monitored App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
