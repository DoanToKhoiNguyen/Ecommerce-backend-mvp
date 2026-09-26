const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Load cấu hình Swagger
const swaggerPath = path.join(__dirname, '../swagger-output.json');
let swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'E-commerce MVP API', version: '1.0.0' },
  paths: {}
};

if (fs.existsSync(swaggerPath)) {
  try {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  } catch (e) {
    console.log('Lỗi đọc file swagger-output.json, dùng cấu hình mặc định.');
  }
}

// Đăng ký route Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import các Routes
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng: ${PORT}`);
  console.log(`📑 Swagger UI: http://localhost:${PORT}/api-docs`);
});