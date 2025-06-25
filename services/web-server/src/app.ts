import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { helloWorldRoutes } from './routes/helloWorld';
import { imageUploadRoutes } from './routes/imageUpload';
import { safeDishesRoutes } from './routes/safeDishes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(existingApp?: Application): Application {
  // Use the provided Express application if available so that callers can
  // register routes *before* the common middleware/404 handler are attached.
  const app: Application = existingApp ?? express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration - Relaxed in development to allow LAN and mobile testing
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      // Reflects the request origin in non-production, enabling access from
      // http://<local-ip>:5173 (or any port you run Vite on) when testing from
      // other devices on the same network.
      : true,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Performance middleware
  app.use(compression());

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes
  app.use('/api', helloWorldRoutes);
  app.use('/api', imageUploadRoutes);
  app.use('/api', safeDishesRoutes);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'web-server',
    });
  });

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
} 