const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'E-commerce MVP API',
    description: 'Tài liệu & Kiểm thử API cho Hệ thống Thương mại Điện tử',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Nhập theo định dạng: Bearer <TOKEN>',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);