import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Timer,
  Check,
} from 'lucide-react';

export const FocusPage: React.FC = () => {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<any[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('lifeos_focus_time');
    return saved ? parseInt(saved, 10) : 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem('lifeos_focus_running') === 'true';
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('lifeos_focus_session_id') || null;
  });
  const [showFinishedDialog, setShowFinishedDialog] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    api.getGoals().then((res) => {
      setGoals(res.goals);
      if (res.goals.length > 0 && !selectedGoalId) {
        setSelectedGoalId(res.goals[0].id);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('lifeos_focus_time', timeLeft.toString());
    localStorage.setItem('lifeos_focus_running', isRunning.toString());
    if (sessionId) localStorage.setItem('lifeos_focus_session_id', sessionId);
  }, [timeLeft, isRunning, sessionId]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleStart = async () => {
    try {
      const res = await api.startFocusSession(selectedGoalId || undefined, durationMinutes * 60);
      setSessionId(res.session.id);
      setIsRunning(true);
    } catch (e) {
      console.error(e);
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durationMinutes * 60);
    localStorage.removeItem('lifeos_focus_session_id');
    setSessionId(null);
  };

  const handleCompleteSession = async () => {
    setIsRunning(false);
    if (sessionId) {
      try {
        await api.updateFocusSession(sessionId, {
          status: 'COMPLETED',
          actualDurationSeconds: durationMinutes * 60 - timeLeft,
        });
      } catch (e) {
        console.error(e);
      }
    }
    setShowFinishedDialog(true);
  };

  const handleMarkGoalFinished = async () => {
    if (selectedGoalId) {
      const goal = goals.find((g) => g.id === selectedGoalId);
      if (goal) {
        await api.completeGoal(goal.id, goal.targetValue);
      }
    }
    setShowFinishedDialog(false);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t.focus.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.focus.subtitle}
        </p>
      </div>

      {/* Focus Timer Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        {/* Goal Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">
            Associated Objective:
          </label>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            disabled={isRunning}
            className="text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium max-w-xs mx-auto focus:outline-none"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.category})
              </option>
            ))}
          </select>
        </div>

        {/* Circular Display */}
        <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100 dark:text-slate-800 fill-none"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className="text-brand-500 fill-none transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">
              {isRunning ? 'In The Zone' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Duration Selectors */}
        {!isRunning && (
          <div className="flex items-center justify-center space-x-2">
            {[15, 25, 45].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setDurationMinutes(m);
                  setTimeLeft(m * 60);
                }}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition ${
                  durationMinutes === m
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-300'
                    : 'text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{t.focus.start}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePause}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>{t.focus.pause}</span>
              </button>
              <button
                onClick={handleCompleteSession}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>{t.focus.finish}</span>
              </button>
            </div>
          )}
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post-Session Completion Modal */}
      {showFinishedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.focus.sessionFinished}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t.focus.verifyGoal}
            </p>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={handleMarkGoalFinished}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
              >
                Yes! Mark Goal Completed 🎉
              </button>
              <button
                onClick={() => {
                  setShowFinishedDialog(false);
                  handleReset();
                }}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Not yet, just recorded session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
