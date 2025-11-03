import { createApp } from './app';
import { config } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import logger from './utils/logger';

/**
 * Start the server
 */
async function startServer() {
  try {
    // ==================== DATABASE CONNECTION ====================
    logger.info('🔄 Connecting to database...');
    await connectDatabase();

    // ==================== CREATE EXPRESS APP ====================
    const app = createApp();

    // ==================== START SERVER ====================
    const server = app.listen(config.PORT, () => {
      logger.info('='.repeat(60));
      logger.info('🚀 EventFlow Backend Server Started Successfully!');
      logger.info('='.repeat(60));
      logger.info(`📍 Environment: ${config.NODE_ENV}`);
      logger.info(`🌐 Server URL: http://localhost:${config.PORT}`);
      logger.info(`📡 API Endpoint: http://localhost:${config.PORT}/api/v1`);
      logger.info(`💾 Database: Neon PostgreSQL (Connected)`);
      logger.info(`🔐 JWT Auth: Enabled`);
      logger.info('='.repeat(60));
      logger.info('📋 Available Routes:');
      logger.info(`   - POST   /api/v1/auth/register`);
      logger.info(`   - POST   /api/v1/auth/login`);
      logger.info(`   - GET    /api/v1/events`);
      logger.info(`   - POST   /api/v1/events`);
      logger.info(`   - POST   /api/v1/participants/join`);
      logger.info(`   - POST   /api/v1/locations`);
      logger.info(`   - POST   /api/v1/zones`);
      logger.info(`   - POST   /api/v1/reports`);
      logger.info('='.repeat(60));
    });

    // ==================== GRACEFUL SHUTDOWN ====================
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n⚠️  ${signal} signal received: closing HTTP server`);
      
      server.close(async () => {
        logger.info('🔄 HTTP server closed');
        
        try {
          await disconnectDatabase();
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⏰ Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('❌ Unhandled Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();