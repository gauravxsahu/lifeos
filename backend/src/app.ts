import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { apiRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import v1Router from './routes';

const app: Application = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, true); // Permissive for local dev & testing
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'LIFEOS — Your AI Digital Friend',
    tagline: 'Less Scrolling. More Living.',
    timestamp: new Date().toISOString(),
  });
});

// Mount v1 REST APIs
app.use('/api/v1', v1Router);

// Centralized error handling
app.use(errorHandler);

export default app;
