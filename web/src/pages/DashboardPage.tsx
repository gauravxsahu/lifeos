import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Smartphone,
  CheckCircle2,
  Timer,
  Sparkles,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [dailyUsage, setDailyUsage] = useState<any>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [topStory, setTopStory] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [rescueSuggestion, setRescueSuggestion] = useState<any>(null);
  const [interventionPreview, setInterventionPreview] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [goalsRes, usageRes, weeklyRes, storiesRes, rescueRes] = await Promise.all([
        api.getGoals(),
        api.getDailyUsage(),
        api.getWeeklyUsage(),
        api.getStories(),
        api.getGoalRescueSuggestion(),
      ]);

      setGoals(goalsRes.goals || []);
      setDailyUsage(usageRes);
      setWeeklyTrend(weeklyRes.weeklyTrend || []);
      if (storiesRes.stories && storiesRes.stories.length > 0) {
        setTopStory(storiesRes.stories[0]);
      }
      setRescueSuggestion(rescueRes);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGoal = async (goal: any) => {
    try {
      const isCurrentlyComplete = goal.isCompletedToday;
      await api.completeGoal(goal.id, isCurrentlyComplete ? 0 : goal.targetValue);
      // Reload goals
      const updated = await api.getGoals();
      setGoals(updated.goals);
    } catch (err) {
      console.error('Failed to toggle goal completion:', err);
    }
  };

  const handleSpeakStory = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      alert('SpeechSynthesis is not supported by your browser.');
    }
  };

  const simulateIntervention = async () => {
    try {
      const res = await api.triggerReminder('com.instagram.android', 35, 30);
      setInterventionPreview(res.reminder);
    } catch (e: any) {
      console.error(e);
    }
  };

  const completedGoalsCount = goals.filter((g) => g.isCompletedToday).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Simulated Intervention Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-700 text-white shadow-lg shadow-brand-500/15">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t.dashboard.greeting}, {user?.displayName}! 👋
          </h1>
          <p className="mt-1 text-brand-100 text-sm">
            LIFEOS is active. Your companion style: <span className="font-semibold underline decoration-brand-300">{user?.communicationStyle?.replace('_', ' ')}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={simulateIntervention}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold transition"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Simulate Smart Intervention</span>
          </button>
          <button
            onClick={() => navigate('/focus')}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold shadow-md transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.dashboard.startFocusBtn}</span>
          </button>
        </div>
      </div>

      {/* Simulated Intervention Alert Modal */}
      {interventionPreview && (
        <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border-2 border-brand-500/40 shadow-md flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-brand-200 dark:bg-brand-900 text-brand-800 dark:text-brand-200 text-[11px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Smart Companion Intervention Triggered</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {interventionPreview.title}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {interventionPreview.message}
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => {
                  setInterventionPreview(null);
                  navigate('/focus');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition"
              >
                Start 20-Min Focus Sprint
              </button>
              <button
                onClick={() => setInterventionPreview(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Dismiss with Kindness
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Goal Rescue Card */}
      {rescueSuggestion?.hasPendingGoals && (
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.dashboard.rescueTitle}</span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
              {rescueSuggestion.rescueMessage}
            </p>
          </div>
          <button
            onClick={() => navigate('/focus')}
            className="flex-shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
          >
            Start Suggested 20m Task
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>{t.dashboard.todayUsage}</span>
            <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {dailyUsage ? `${Math.round(dailyUsage.totalMinutes)} min` : '0 min'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {dailyUsage?.hasSyncedDevice
              ? 'Aggregated via Android UsageStats'
              : 'Synced via registered Android companion'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>{t.dashboard.goalsCompleted}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {completedGoalsCount} / {goals.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {goals.length > 0
              ? `${Math.round((completedGoalsCount / goals.length) * 100)}% daily targets reached`
              : 'Add your first target in Daily Goals'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>{t.dashboard.focusTime}</span>
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            25 min
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            1 completed focus session today
          </div>
        </div>
      </div>

      {/* Main Two Column Layout: Daily Goals & Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Goals Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.goals.title}
            </h3>
            <button
              onClick={() => navigate('/goals')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                {t.goals.empty}
              </p>
            ) : (
              goals.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleToggleGoal(g)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    g.isCompletedToday
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-brand-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        g.isCompletedToday
                          ? 'bg-brand-600 border-brand-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {g.isCompletedToday && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${g.isCompletedToday ? 'line-through' : ''}`}>
                        {g.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                        <span>{g.category}</span>
                        <span>•</span>
                        <span>
                          {g.targetValue} {g.targetUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      g.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {g.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.dashboard.weeklyTrend}
            </h3>
            <span className="text-xs text-slate-500">Last 7 Days</span>
          </div>

          <div className="h-60 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="m" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="socialMinutes" name="Social Usage" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="focusMinutes" name="Focus Time" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Verified Motivational Story of the Day */}
      {topStory && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.dashboard.topStory}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                VERIFIED BIOGRAPHY
              </span>
            </div>

            <button
              onClick={() => handleSpeakStory(topStory.fullContent)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.stories.stopAudio}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>{t.stories.listen}</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {topStory.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {topStory.fullContent}
            </p>
          </div>

          {topStory.sources && topStory.sources.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Verified Historical Reference:{' '}
              </span>
              <a
                href={topStory.sources[0].sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>{topStory.sources[0].sourceName}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
