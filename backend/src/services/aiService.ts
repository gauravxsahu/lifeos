import { config } from '../config/env';

export interface AIReminderInput {
  userName: string;
  language: string;
  careerCategory: string;
  communicationStyle: string;
  packageName: string;
  appName: string;
  usageMinutes: number;
  thresholdMinutes: number;
  unfinishedGoals: Array<{ id: string; title: string; targetValue: number; targetUnit: string }>;
}

export interface AIReminderOutput {
  title: string;
  message: string;
  language: string;
  communicationStyle: string;
  suggestedAction: {
    actionType: 'START_FOCUS' | 'DO_GOAL' | 'TAKE_BREAK';
    goalId?: string;
    goalTitle?: string;
    suggestedMinutes: number;
  };
  audioScript: string;
}

export class AIService {
  public async generateReminder(input: AIReminderInput, forceFallback = false): Promise<AIReminderOutput> {
    if (forceFallback || (!config.geminiApiKey && !config.openaiApiKey)) {
      return this.getFallbackReminder(input);
    }

    try {
      const generated = await this.callLLMForReminder(input);
      if (this.validateReminder(generated)) {
        return generated;
      }
    } catch (err) {
      console.warn('[AIService] Provider call failed. Using deterministic fallback:', err);
    }

    return this.getFallbackReminder(input);
  }

  public getFallbackReminder(input: AIReminderInput): AIReminderOutput {
    const lang = input.language || 'en';
    const app = input.appName || 'social app';
    const style = input.communicationStyle || 'FRIENDLY_FRIEND';
    const goal = input.unfinishedGoals.length > 0 ? input.unfinishedGoals[0] : null;

    let title = 'LIFEOS Digital Friend';
    let message = '';
    let audioScript = '';

    if (lang === 'hi' || lang === 'hinglish') {
      if (style === 'FRIENDLY_FRIEND') {
        title = `Hey dost! ❤️`;
        message = `${app} par ${input.usageMinutes} minutes ho gaye hain. ${goal ? `Tumhara goal "${goal.title}" yaad hai? Chalo 20 minutes nikaal kar ek step lete hain!` : 'Chalo thoda break lete hain aur real world mein aate hain!'}`;
        audioScript = message;
      } else if (style === 'PROFESSIONAL_MENTOR') {
        title = `Focus Reminder`;
        message = `Aapne ${app} par ${input.usageMinutes} minutes bitaye hain. ${goal ? `Apne career roadmap "${goal.title}" par dhyan kendrit karein.` : 'Agla focus session shuru karein.'}`;
        audioScript = message;
      } else if (style === 'MOTIVATOR') {
        title = `Take Action Today! 🚀`;
        message = `${app} par samay beeta, par aapka future aapka intezar kar raha hai! ${goal ? `Abhi "${goal.title}" par 25 minute ka sprint lagao!` : 'Apne goals par aage badho!'}`;
        audioScript = message;
      } else {
        // CALM_COMPANION
        title = `A Gentle Pause 🌿`;
        message = `Koi baat nahi, agar thoda samay scroll karne mein nikal gaya. ${goal ? `Shanti se "${goal.title}" par chhota sa prayas karte hain.` : 'Gehri saans lo aur thoda aaram karo.'}`;
        audioScript = message;
      }
    } else {
      // Default to English
      if (style === 'FRIENDLY_FRIEND') {
        title = `Hey friend! ❤️`;
        message = `${input.usageMinutes} minutes on ${app} already! ${goal ? `Remember your goal: "${goal.title}"? Let’s spend 20 minutes making progress on it!` : 'How about taking a refreshing stretch break?'}`;
        audioScript = message;
      } else if (style === 'PROFESSIONAL_MENTOR') {
        title = `Productivity Advisory`;
        message = `You have accumulated ${input.usageMinutes} minutes on ${app}. ${goal ? `Prioritize "${goal.title}" to protect your daily velocity.` : 'Consider initiating your next structured focus block.'}`;
        audioScript = message;
      } else if (style === 'MOTIVATOR') {
        title = `Your Future is Waiting! 🚀`;
        message = `Break free from mindless scrolling! ${goal ? `Spend the next 25 minutes conquering "${goal.title}"!` : 'Channel your energy into your ambition today!'}`;
        audioScript = message;
      } else {
        // CALM_COMPANION
        title = `A Gentle Check-in 🌿`;
        message = `It is completely fine to take downtime. Whenever you are ready, ${goal ? `spend a calm 15 minutes on "${goal.title}".` : 'give your eyes a gentle screen break.'}`;
        audioScript = message;
      }
    }

    return {
      title,
      message,
      language: lang,
      communicationStyle: style,
      suggestedAction: {
        actionType: goal ? 'DO_GOAL' : 'START_FOCUS',
        goalId: goal?.id,
        goalTitle: goal?.title,
        suggestedMinutes: 20,
      },
      audioScript,
    };
  }

  private async callLLMForReminder(input: AIReminderInput): Promise<AIReminderOutput> {
    if (config.geminiApiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
      const promptText = `You are LIFEOS - an empathetic digital wellness friend.
User: ${input.userName}
Language: ${input.language}
Communication Style: ${input.communicationStyle}
App monitored: ${input.appName} (${input.usageMinutes} minutes reached, threshold ${input.thresholdMinutes}m)
Unfinished goals: ${JSON.stringify(input.unfinishedGoals)}

Rules:
- NEVER shame, guilt-trip, or manipulate.
- Speak in the requested language (if hinglish, use natural spoken Hindi-English mix).
- Max 50 words for message.
- Audio script should be friendly and conversational.

Respond ONLY with valid JSON:
{
  "title": "string",
  "message": "string",
  "language": "${input.language}",
  "communicationStyle": "${input.communicationStyle}",
  "suggestedAction": {
    "actionType": "START_FOCUS" or "DO_GOAL",
    "suggestedMinutes": 20
  },
  "audioScript": "string"
}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
        }),
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawText);
      return parsed;
    }

    throw new Error('No API key configured for LLM');
  }

  private validateReminder(out: any): boolean {
    if (!out || typeof out !== 'object') return false;
    if (typeof out.title !== 'string' || typeof out.message !== 'string') return false;
    const lower = out.message.toLowerCase();
    const banned = ['ashamed', 'loser', 'waste of time', 'disappointing', 'failure'];
    for (const b of banned) {
      if (lower.includes(b)) return false;
    }
    return true;
  }
}

export const aiService = new AIService();
