const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    // Kiểm tra kết nối CSDL PostgreSQL bằng truy vấn nhẹ
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      message: 'Hệ thống và Cơ sở dữ liệu đang hoạt động bình thường!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Lỗi kết nối Cơ sở dữ liệu!',
      error: error.message
    });
  }
});

module.exports = router;