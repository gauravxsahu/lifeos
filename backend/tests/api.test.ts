import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prisma';

describe('LIFEOS Backend API Test Suite', () => {
  let authToken = '';
  let secondUserToken = '';
  let createdGoalId = '';
  let createdAppId = '';
  let createdThresholdId = '';

  const testEmail = `testuser_${Date.now()}@lifeos.dev`;
  const secondUserEmail = `otheruser_${Date.now()}@lifeos.dev`;

  beforeAll(async () => {
    // Ensure clean state
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, secondUserEmail] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, secondUserEmail] } },
    });
    await prisma.$disconnect();
  });

  // Health check
  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.product).toBe('LIFEOS — Your AI Digital Friend');
  });

  // Auth: Register User 1
  it('POST /api/v1/auth/register should register a user and return token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'password123',
        displayName: 'Test Runner',
        preferredLanguage: 'hinglish',
        careerCategory: 'Software Engineering',
        communicationStyle: 'FRIENDLY_FRIEND',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    authToken = res.body.data.token;
  });

  // Auth: Register User 2 for isolation testing
  it('POST /api/v1/auth/register should register User 2', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: secondUserEmail,
        password: 'password123',
        displayName: 'Other User',
        preferredLanguage: 'en',
      });

    expect(res.status).toBe(201);
    secondUserToken = res.body.data.token;
  });

  // Auth: Login
  it('POST /api/v1/auth/login should authenticate user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  // Auth: Me
  it('GET /api/v1/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.displayName).toBe('Test Runner');
  });

  // Goals: Create Goal
  it('POST /api/v1/goals should create a new daily goal', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Solve two DSA questions',
        description: 'Practice dynamic programming',
        category: 'Career',
        targetValue: 2,
        targetUnit: 'questions',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.goal.title).toBe('Solve two DSA questions');
    createdGoalId = res.body.data.goal.id;
  });

  // Goals: User Data Isolation
  it('GET /api/v1/goals should isolate goals between different users', async () => {
    // User 1 sees their goal
    const res1 = await request(app)
      .get('/api/v1/goals')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res1.body.data.goals.some((g: any) => g.id === createdGoalId)).toBe(true);

    // User 2 must NOT see User 1's goal
    const res2 = await request(app)
      .get('/api/v1/goals')
      .set('Authorization', `Bearer ${secondUserToken}`);
    expect(res2.body.data.goals.some((g: any) => g.id === createdGoalId)).toBe(false);
  });

  // Goals: Complete Goal
  it('POST /api/v1/goals/:id/completions should record goal completion', async () => {
    const res = await request(app)
      .post(`/api/v1/goals/${createdGoalId}/completions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        completedValue: 2,
        isCompleted: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.completion.isCompleted).toBe(true);
  });

  // Apps: Create Monitored Application
  it('POST /api/v1/apps should create monitored app with default thresholds', async () => {
    const res = await request(app)
      .post('/api/v1/apps')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        packageName: 'com.instagram.android',
        displayName: 'Instagram',
        dailyLimitMinutes: 45,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.app.displayName).toBe('Instagram');
    expect(res.body.data.app.thresholds.length).toBe(3);
    createdAppId = res.body.data.app.id;
    createdThresholdId = res.body.data.app.thresholds[0].id;
  });

  // Thresholds: Update Threshold
  it('PATCH /api/v1/thresholds/:id should update reminder mode', async () => {
    const res = await request(app)
      .patch(`/api/v1/thresholds/${createdThresholdId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        reminderMode: 'VOICE_AND_TEXT',
        voiceEnabled: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.threshold.reminderMode).toBe('VOICE_AND_TEXT');
    expect(res.body.data.threshold.voiceEnabled).toBe(true);
  });

  // Usage: Sync Device Usage
  it('POST /api/v1/usage/sync should sync batch usage summaries', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/v1/usage/sync')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        deviceId: 'pixel-test-device-uuid',
        platform: 'ANDROID',
        deviceName: 'Pixel 8',
        summaries: [
          {
            packageName: 'com.instagram.android',
            usageDate: today,
            durationMinutes: 32,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Stories: Get Verified Stories with Sources
  it('GET /api/v1/stories should return verified stories with bibliographic sources', async () => {
    const res = await request(app)
      .get('/api/v1/stories')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stories.length).toBeGreaterThan(0);
    const story = res.body.data.stories[0];
    expect(story.verificationStatus).toBe('VERIFIED');
    expect(story.sources.length).toBeGreaterThan(0);
    expect(story.sources[0].sourceUrl).toMatch(/^https?:\/\//);
  });

  // Focus: Start and complete a focus session
  it('POST /api/v1/focus/sessions should record session lifecycle', async () => {
    const startRes = await request(app)
      .post('/api/v1/focus/sessions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        goalId: createdGoalId,
        durationSeconds: 1500,
      });

    expect(startRes.status).toBe(201);
    const sessionId = startRes.body.data.session.id;

    const patchRes = await request(app)
      .patch(`/api/v1/focus/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'COMPLETED',
        actualDurationSeconds: 1500,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.session.status).toBe('COMPLETED');
  });

  // AI Reminder & Fallback Validation
  it('POST /api/v1/ai/reminder with forceFallback should return empathetic message without shame', async () => {
    const res = await request(app)
      .post('/api/v1/ai/reminder')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        packageName: 'com.instagram.android',
        usageMinutes: 30,
        thresholdMinutes: 30,
        forceFallback: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reminder).toBeDefined();
    expect(res.body.data.reminder.title).toBeDefined();
    expect(res.body.data.reminder.message).not.toMatch(/shame|loser|waste/i);
    expect(res.body.data.interventionId).toBeDefined();
  });

  // Preferences: Update language and voice
  it('PATCH /api/v1/preferences/language should update user preferred language', async () => {
    const res = await request(app)
      .patch('/api/v1/preferences/language')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ preferredLanguage: 'hi' });

    expect(res.status).toBe(200);
    expect(res.body.data.preferredLanguage).toBe('hi');
  });
});
