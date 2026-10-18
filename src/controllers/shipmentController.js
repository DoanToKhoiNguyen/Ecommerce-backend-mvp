const shipmentService = require('../services/shipmentService');

exports.updateShipmentStatus = async (req, res) => {
  try {
    const updatedShipment = await shipmentService.updateShipmentStatus(
      req.params.shipid,
      req.body.status
    );

    res.status(200).json({
      message: 'Cập nhật trạng thái vận chuyển thành công!',
      updatedShipment
    });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error('updateShipmentStatus error:', error);
    res.status(status).json({
      message: status === 500 ? 'Lỗi server!' : error.message
    });
  }
};