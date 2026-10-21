import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`🚀 LIFEOS Backend running at http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
