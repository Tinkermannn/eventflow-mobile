import express, { Express, Request, Response } from 'express';
import compression from 'compression';
import { setupSecurityMiddleware } from './middleware/security';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import router from './routes';
import logger from './utils/logger';

/**
 * Create Express application
 */
export function createApp(): Express {
  const app: Express = express();

  // ==================== MIDDLEWARE ====================

  // 1. Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 2. Compression
  app.use(compression());

  // 3. Security middleware (helmet, cors, rate limiting, etc.)
  setupSecurityMiddleware(app);

  // 4. Request logging
  app.use(requestLogger);

  // 5. Response time header
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      res.setHeader('X-Response-Time', `${duration}ms`);
    });
    next();
  });

  // ==================== ROUTES ====================

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Welcome to EventFlow API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
    });
  });

  // API v1 routes
  app.use('/api/v1', router);

  // ==================== ERROR HANDLING ====================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  // ==================== PROCESS HANDLERS ====================

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
    logger.error('Unhandled Rejection at:', { promise, reason: reason.message });
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
    // Exit process after logging
    process.exit(1);
  });

  return app;
}