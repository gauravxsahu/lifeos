import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  BookOpen,
  ShieldCheck,
  Volume2,
  VolumeX,
  ExternalLink,
  Bookmark,
  Sparkles,
} from 'lucide-react';

export const StoriesPage: React.FC = () => {
  const { t } = useLanguage();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeAudioStoryId, setActiveAudioStoryId] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, [selectedCategory]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const res = await api.getStories(selectedCategory === 'ALL' ? undefined : selectedCategory);
      setStories(res.stories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (storyId: string) => {
    try {
      await api.saveStory(storyId);
      loadStories();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayAudio = (storyId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('SpeechSynthesis not available in this browser.');
      return;
    }

    if (activeAudioStoryId === storyId) {
      window.speechSynthesis.cancel();
      setActiveAudioStoryId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setActiveAudioStoryId(null);
      utterance.onerror = () => setActiveAudioStoryId(null);
      window.speechSynthesis.speak(utterance);
      setActiveAudioStoryId(storyId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.stories.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.stories.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'Software Engineering', 'Artificial Intelligence', 'Leadership & Entrepreneurship', 'Personal Development & Productivity'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Stories' : cat.split(' ')[0]}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.map((s) => (
          <div
            key={s.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{s.verificationStatus}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlayAudio(s.id, s.fullContent)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title={activeAudioStoryId === s.id ? 'Stop audio' : 'Listen with Voice Assistant'}
                  >
                    {activeAudioStoryId === s.id ? (
                      <VolumeX className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-brand-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleToggleSave(s.id)}
                    className={`p-2 rounded-lg transition ${
                      s.isSaved
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={s.isSaved ? 'Bookmarked' : 'Bookmark story'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
                  {s.subject} • {s.careerCategory}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {s.title}
                </h3>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {s.fullContent}
              </p>
            </div>

            {s.sources && s.sources.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Verified Sourced Reference:{' '}
                </span>
                <a
                  href={s.sources[0].sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center space-x-1"
                >
                  <span>{s.sources[0].sourceName}</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
