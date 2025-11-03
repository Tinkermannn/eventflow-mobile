import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';
import { Express } from 'express';
import { config } from '../config/environment';

export function setupSecurityMiddleware(app: Express) {
    // 1. Helmet - Set security HTTP headers
    app.use(
        helmet({
        contentSecurityPolicy: {
            directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        })
    );

    // 2. CORS - Control cross-origin requests
    const allowedOrigins = config.ALLOWED_ORIGINS;
    
    app.use(
        cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
            } else {
            callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );

    // 3. Rate Limiting - General API routes
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use('/api/', limiter);

    // 4. Stricter rate limit for auth routes
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 attempts
        message: 'Too many login attempts, please try again after 15 minutes.',
        skipSuccessfulRequests: true,
    });

    app.use('/api/v1/auth/login', authLimiter);
    app.use('/api/v1/auth/register', authLimiter);

    // 5. XSS Protection - Sanitize user input
    app.use(xss());

    // 6. HTTP Parameter Pollution Protection
    app.use(
        hpp({
        whitelist: ['sort', 'fields', 'page', 'limit', 'status', 'role'],
        })
    );
}