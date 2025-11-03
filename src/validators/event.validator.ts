import { body, param, query } from 'express-validator';

export const createEventValidator = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event name must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('maxCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max capacity must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
];

export const updateEventValidator = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event name must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('maxCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max capacity must be a positive integer'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
];

export const getEventValidator = [
  param('id')
    .notEmpty()
    .withMessage('Event ID is required'),
];

export const listEventsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
];