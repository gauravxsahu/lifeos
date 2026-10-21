import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20, // max 20 login/register attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts. Please wait 15 minutes before trying again.',
      statusCode: 429,
    },
  },
});
