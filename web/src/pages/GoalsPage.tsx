import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Target,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career',
    targetValue: 1,
    targetUnit: 'task',
    priority: 'HIGH',
    schedule: 'DAILY',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getGoals();
      setGoals(res.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal(formData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Career',
        targetValue: 1,
        targetUnit: 'task',
        priority: 'HIGH',
        schedule: 'DAILY',
      });
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (goal: any) => {
    try {
      const isCurrentlyComplete = goal.isCompletedToday;
      await api.completeGoal(goal.id, isCurrentlyComplete ? 0 : goal.targetValue);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to remove this goal?')) return;
    try {
      await api.deleteGoal(goalId);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGoals = filterCategory === 'ALL'
    ? goals
    : goals.filter((g) => g.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.goals.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.goals.subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Categories</option>
            <option value="Career">Career & Tech</option>
            <option value="Studies">Studies & Learning</option>
            <option value="Personal Development">Personal Development</option>
            <option value="Fitness">Fitness & Health</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.goals.addGoal}</span>
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{t.goals.empty}</p>
          </div>
        ) : (
          filteredGoals.map((g) => (
            <div
              key={g.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                g.isCompletedToday
                  ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleToggleComplete(g)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                    g.isCompletedToday
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'border-slate-300 dark:border-slate-700 hover:border-brand-500'
                  }`}
                >
                  {g.isCompletedToday && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <h4 className={`text-sm font-bold ${g.isCompletedToday ? 'line-through text-slate-400' : ''}`}>
                    {g.title}
                  </h4>
                  {g.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
                  )}
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {g.category}
                    </span>
                    <span>•</span>
                    <span>
                      Target: {g.targetValue} {g.targetUnit}
                    </span>
                    <span>•</span>
                    <span className="uppercase font-semibold tracking-wider text-[10px]">
                      {g.priority} priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDelete(g.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="Delete goal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.goals.addGoal}
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Solve two DSA problems"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional context"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <option value="Career">Career & Tech</option>
                    <option value="Studies">Studies</option>
                    <option value="Personal Development">Personal Development</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Unit
                  </label>
                  <select
                    value={formData.targetUnit}
                    onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <option value="questions">Questions / Problems</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="pages">Pages Read</option>
                    <option value="task">Task / Item</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
