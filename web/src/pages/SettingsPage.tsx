import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Settings,
  Globe,
  Volume2,
  Clock,
  ShieldCheck,
  Download,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(null);
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      setLoading(true);
      const res = await api.getPreferences();
      setPreferences(res);
      setSpeakingRate(res.speakingRate || 1.0);
      setSoundEnabled(res.notificationSoundEnabled ?? true);
      setVoiceEnabled(res.voiceAssistantEnabled ?? true);
      setQuietHoursStart(res.quietHoursStart || '22:00');
      setQuietHoursEnd(res.quietHoursEnd || '07:00');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePreferences({
        speakingRate,
        notificationSoundEnabled: soundEnabled,
        voiceAssistantEnabled: voiceEnabled,
        quietHoursStart,
        quietHoursEnd,
      });
      setStatusMsg('Preferences saved successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (e: any) {
      alert(e.message || 'Error saving settings');
    }
  };

  const handleTestVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Hello ${user?.displayName || 'friend'}! This is your LIFEOS voice companion. Less scrolling, more living!`
      );
      utterance.rate = speakingRate;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('SpeechSynthesis not supported in this browser.');
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.exportData();
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('Export failed: ' + e.message);
    }
  };

  const handleDeleteUsage = async () => {
    if (!confirm('Are you sure you want to permanently delete all device usage statistics?')) return;
    try {
      await api.deleteUsageData();
      alert('Usage statistics purged successfully.');
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type DELETE to permanently erase your LIFEOS account and all data:');
    if (confirmation === 'DELETE') {
      try {
        await api.deleteAccount();
        window.location.href = '/';
      } catch (e: any) {
        alert('Account deletion failed: ' + e.message);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.settings.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your digital companion, voice behavior, quiet hours, and privacy rights.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Language Selection */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>{t.settings.language}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {supportedLanguages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`p-3 rounded-xl border text-left text-xs transition ${
                  language === l.code
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 font-bold ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div>{l.native}</div>
                <div className="text-[10px] text-slate-500 font-normal">{l.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice & Sound Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <Volume2 className="w-4 h-4 text-brand-600" />
            <span>{t.settings.voiceAssistant}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Enable Voice Companion
                </div>
                <div className="text-[11px] text-slate-500">
                  Speaks interventions and motivational stories aloud when enabled.
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  {t.settings.soundReminder}
                </div>
                <div className="text-[11px] text-slate-500">
                  Plays a controlled 5-second gentle sound before reminders.
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>Speaking Rate: {speakingRate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={speakingRate}
                onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              type="button"
              onClick={handleTestVoice}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Test Voice Playback
            </button>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>{t.settings.quietHours}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition"
        >
          Save All Preferences
        </button>
      </form>

      {/* Privacy & Data Rights Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t.settings.privacy}</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          In LIFEOS, you own 100% of your data. We never sell your personal information or record your private screen contents.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.settings.exportData}</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteUsage}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.settings.deleteUsage}</span>
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.settings.deleteAccount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
