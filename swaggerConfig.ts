import { SwaggerDefinition, Options } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DNA Analysis API',
    version: '1.0.0',
    description: 'API to analyze DNA sequences and retrieve statistics',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
};

export const swaggerOptions: Options = {
  swaggerDefinition,
  apis: ['./src/controllers/*.ts', './src/dtos/*.ts'],
};
