import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`🚀 LIFEOS Backend running at http://0.0.0.0:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
