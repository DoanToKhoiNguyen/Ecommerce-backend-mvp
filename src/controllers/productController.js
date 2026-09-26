const prisma = require('../config/db');

// Lấy danh sách sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

// Admin thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;
    const newProduct = await prisma.product.create({
      data: { pname, price: parseFloat(price), quantity: parseInt(quantity) }
    });
    res.status(201).json({ message: 'Thêm sản phẩm thành công!', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};