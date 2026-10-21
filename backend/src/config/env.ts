import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5435/lifeos_db?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-lifeos-jwt-key-for-development-change-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
};
