import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    preferredLanguage: 'en',
    careerCategory: 'Software Engineering',
    communicationStyle: 'FRIENDLY_FRIEND',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.displayName || !formData.email || !formData.password) {
        setError('Please fill in all basic information fields.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setError('');
      setStep(2);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Your LIFEOS Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Step {step} of 2: {step === 1 ? 'Your Account & Security' : 'Personalization & Preferences'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-4">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name / Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-md shadow-brand-500/20"
              >
                Continue to Personalization →
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Language
                </label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="hinglish">Hinglish (Natural Spoken Mix)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Career / Study Focus
                </label>
                <select
                  value={formData.careerCategory}
                  onChange={(e) => handleChange('careerCategory', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Software Engineering">Software Engineering & Development</option>
                  <option value="Artificial Intelligence">Artificial Intelligence & Data Science</option>
                  <option value="Leadership & Entrepreneurship">Startups & Entrepreneurship</option>
                  <option value="Personal Development & Productivity">Academics & Competitive Exams</option>
                  <option value="Creative Design">Design & Creative Media</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Companion Communication Style
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'FRIENDLY_FRIEND', label: 'Friendly Friend', desc: 'Supportive peer: "Hey dost, let’s solve one DSA problem!"' },
                    { id: 'PROFESSIONAL_MENTOR', label: 'Professional Mentor', desc: 'Objective & high-leverage: "Protect your daily velocity."' },
                    { id: 'MOTIVATOR', label: 'Motivator', desc: 'High energy: "Build your future today!"' },
                    { id: 'CALM_COMPANION', label: 'Calm Companion', desc: 'Gentle & pressure-free: "One small peaceful step."' },
                  ].map((style) => (
                    <button
                      type="button"
                      key={style.id}
                      onClick={() => handleChange('communicationStyle', style.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.communicationStyle === style.id
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{style.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {style.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating Account...' : 'Complete Setup'}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
