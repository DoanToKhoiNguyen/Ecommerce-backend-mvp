const prisma = require('../config/db');

// Admin cập nhật trạng thái giao hàng
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { shipid } = req.params;
    const { status } = req.body;

    const updatedShipment = await prisma.shipment.update({
      where: { shipid: parseInt(shipid) },
      data: { status }
    });

    res.status(200).json({ message: 'Cập nhật trạng thái vận chuyển thành công!', updatedShipment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};