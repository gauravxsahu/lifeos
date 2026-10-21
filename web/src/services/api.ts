const API_BASE = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('lifeos_token');
  }

  public setToken(token: string | null) {
    if (token) {
      localStorage.setItem('lifeos_token', token);
    } else {
      localStorage.removeItem('lifeos_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `API error: ${response.statusText}`);
    }

    return data.data;
  }

  // Auth
  async register(body: any) {
    const data = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(body: any) {
    const data = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Goals
  async getGoals() {
    return this.request<{ goals: any[] }>('/goals');
  }

  async createGoal(body: any) {
    return this.request<{ goal: any }>('/goals', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async completeGoal(goalId: string, completedValue: number) {
    return this.request<{ completion: any }>(`/goals/${goalId}/completions`, {
      method: 'POST',
      body: JSON.stringify({ completedValue, isCompleted: true }),
    });
  }

  async deleteGoal(goalId: string) {
    return this.request<any>(`/goals/${goalId}`, { method: 'DELETE' });
  }

  // Monitored Apps & Thresholds
  async getApps() {
    return this.request<{ apps: any[] }>('/apps');
  }

  async createApp(body: any) {
    return this.request<{ app: any }>('/apps', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteApp(appId: string) {
    return this.request<any>(`/apps/${appId}`, { method: 'DELETE' });
  }

  async updateThreshold(thresholdId: string, body: any) {
    return this.request<{ threshold: any }>(`/thresholds/${thresholdId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // Usage
  async getDailyUsage(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request<any>(`/usage/daily${query}`);
  }

  async getWeeklyUsage() {
    return this.request<any>('/usage/weekly');
  }

  // Stories
  async getStories(category?: string) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<{ stories: any[] }>(`/stories${query}`);
  }

  async saveStory(storyId: string) {
    return this.request<any>(`/stories/${storyId}/save`, { method: 'POST' });
  }

  // Focus Sessions
  async startFocusSession(goalId?: string, durationSeconds = 1500) {
    return this.request<{ session: any }>('/focus/sessions', {
      method: 'POST',
      body: JSON.stringify({ goalId, durationSeconds }),
    });
  }

  async updateFocusSession(sessionId: string, body: any) {
    return this.request<{ session: any }>(`/focus/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async getFocusSessions() {
    return this.request<any>('/focus/sessions');
  }

  // Preferences
  async getPreferences() {
    return this.request<any>('/preferences');
  }

  async updatePreferences(body: any) {
    return this.request<any>('/preferences', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async updateLanguage(preferredLanguage: string) {
    return this.request<any>('/preferences/language', {
      method: 'PATCH',
      body: JSON.stringify({ preferredLanguage }),
    });
  }

  // AI
  async getGoalRescueSuggestion() {
    return this.request<any>('/ai/goal-suggestion', {
      method: 'POST',
      body: JSON.stringify({ timeAvailableMinutes: 25 }),
    });
  }

  async triggerReminder(packageName: string, usageMinutes: number, thresholdMinutes: number) {
    return this.request<any>('/ai/reminder', {
      method: 'POST',
      body: JSON.stringify({ packageName, usageMinutes, thresholdMinutes, forceFallback: true }),
    });
  }

  // Privacy
  async exportData() {
    return this.request<any>('/preferences/privacy/export');
  }

  async deleteUsageData() {
    return this.request<any>('/preferences/privacy/usage', { method: 'DELETE' });
  }

  async deleteAccount() {
    return this.request<any>('/preferences/privacy/account', { method: 'DELETE' });
  }
}

export const api = new ApiClient();
