import morgan from 'morgan';
import logger from '../utils/logger';

// Custom token for morgan
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '';
});

// Create morgan middleware
export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }
);