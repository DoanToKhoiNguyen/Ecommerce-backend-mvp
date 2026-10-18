const productService = require('../services/productService');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({ message: 'Lỗi server!' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ message: 'Thêm sản phẩm thành công!', product });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error('createProduct error:', error);
    res.status(status).json({
      message: status === 500 ? 'Lỗi server!' : error.message
    });
  }
};