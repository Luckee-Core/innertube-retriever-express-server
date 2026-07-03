import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { setupEarlyMiddleware } from './src/services/middleware';
import { setupErrorHandling } from './src/services/middleware';
import { createHealthRouter } from './src/services/health';
import { createTranscriptRouter } from './src/routes/create-transcript-router';
import { createDataRouter } from './src/services/api-data/router';
import { initManagedClients } from './src/services/managed';
import { startServer } from './src/services/server';

const PORT = Number(process.env.PORT) || 3048;

/**
 * Bootstraps Express: init managed clients, mount routes, start listening.
 */
const bootstrap = async (): Promise<void> => {
  await initManagedClients();

  const app = express();

  setupEarlyMiddleware(app);

  app.use('/', createHealthRouter());
  app.use('/api/health', createHealthRouter());
  app.use('/api/transcript', createTranscriptRouter());
  app.use('/api/data', createDataRouter());

  setupErrorHandling(app);

  startServer(app, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
  });
};

void bootstrap();

export default express();
