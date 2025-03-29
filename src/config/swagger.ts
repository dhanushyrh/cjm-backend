import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CJM API Documentation',
      version: '1.0.0',
      description: 'API documentation for the CJM (Coatal Jewelry Mangalore) system',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      // { name: 'Auth', description: 'Authentication endpoints' },
      // { name: 'Admin Auth', description: 'Admin authentication endpoints' },
      // { name: 'Users', description: 'User management endpoints' },
      // { name: 'Schemes', description: 'Scheme management endpoints' },
      // { name: 'Gold Price', description: 'Gold price management endpoints' },
      // { name: 'Transactions', description: 'Transaction management endpoints' },
      // { name: 'Point Redemption', description: 'Point redemption endpoints' },
      // { name: 'Admin Redemption', description: 'Admin redemption management endpoints' },
      // { name: 'Settings', description: 'System settings endpoints' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options); 