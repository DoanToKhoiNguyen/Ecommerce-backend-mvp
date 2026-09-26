const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', authenticateToken, requireAdmin, productController.createProduct);

module.exports = router;