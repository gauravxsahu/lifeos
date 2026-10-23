// LIFEOS Mobile App - API Service Configuration
// Pointing to Live Production Render Backend

const BASE_URL = 'https://lifeos-m012.onrender.com/api/v1';

export class MobileApiService {
  private static token: string | null = null;

  static setToken(jwt: string) {
    this.token = jwt;
  }

  static getBaseUrl(): string {
    return BASE_URL;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(err.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Interventions & Smart AI
  static async getAIIntervention(appName: string, usageMinutes: number, goalName?: string) {
    return this.request<{ reminder: string; action: string }>('/ai/reminder', {
      method: 'POST',
      body: JSON.stringify({
        appName,
        usageMinutes,
        goalName,
        forceFallback: false,
      }),
    });
  }

  // Usage Sync
  static async syncUsage(summaries: Array<{ packageName: string; date: string; durationMinutes: number }>) {
    return this.request('/usage/sync', {
      method: 'POST',
      body: JSON.stringify({ summaries }),
    });
  }

  // Goals
  static async getGoals() {
    return this.request<Array<{ id: string; title: string; category: string; targetMinutes: number }>>('/goals');
  }

  // Verified Stories
  static async getStories() {
    return this.request<Array<{ id: string; title: string; summary: string; audioText: string }>>('/stories');
  }
}
