const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.put('/:shipid', authenticateToken, requireAdmin, shipmentController.updateShipmentStatus);

module.exports = router;