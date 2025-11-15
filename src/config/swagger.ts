/**
 * File: swagger.ts
 * Author: eventFlow Team
 * Deskripsi: Konfigurasi Swagger untuk dokumentasi API backend eventFlow.
 * Dibuat: 2025-11-11
 * Terakhir Diubah: 2025-11-11
 * Versi: 1.0.0
 * Lisensi: MIT
 * Dependensi: swagger-jsdoc, swagger-ui-express
 */
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'eventFlow API',
      version: '1.0.0',
      description: 'API documentation for eventFlow backend',
      contact: {
        name: 'eventFlow Team',
        email: 'support@eventflow.com', // opsional
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://api.eventflow.com', // opsional: production server
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan JWT token yang didapat dari endpoint /auth/login',
        },
      },
      schemas: {
        // Schema global yang bisa dipakai di semua endpoint
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Nama lengkap user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email user',
              example: 'john@example.com',
            },
            phoneNumber: {
              type: 'string',
              description: 'Nomor telepon user',
              example: '081234567890',
            },
            avatarUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL avatar user',
              example: 'https://example.com/avatar.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tanggal pembuatan akun',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tanggal update terakhir',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Jenis error',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              description: 'Pesan error detail',
              example: 'Invalid input data',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Pesan sukses',
              example: 'Operation successful',
            },
          },
        },
      },
      responses: {
        // Response global yang bisa dipakai di semua endpoint
        UnauthorizedError: {
          description: 'Token tidak valid atau tidak ada',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Unauthorized',
                message: 'Invalid or missing token',
              },
            },
          },
        },
        BadRequestError: {
          description: 'Request tidak valid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Bad Request',
                message: 'Invalid request data',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource tidak ditemukan',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Not Found',
                message: 'Resource not found',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Internal Server Error',
                message: 'Something went wrong on the server',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoint autentikasi dan manajemen user',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/**/*.ts', // untuk nested routes
    './src/controllers/*.ts',
    './src/controllers/**/*.ts', // untuk nested controllers
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;