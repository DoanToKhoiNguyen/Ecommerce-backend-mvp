const prisma = require('../config/db');

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Chỉnh lại danh sách này cho khớp với các trạng thái bạn dùng
const VALID_STATUSES = ['Pending', 'Shipping', 'Delivered', 'Cancelled'];

exports.updateShipmentStatus = async (shipid, status) => {
  const id = Number(shipid);
  if (!Number.isInteger(id) || id <= 0) {
    throw fail(400, 'shipid không hợp lệ!');
  }

  if (!VALID_STATUSES.includes(status)) {
    throw fail(400, `Trạng thái không hợp lệ! Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`);
  }

  try {
    return await prisma.shipment.update({
      where: { shipid: id },
      data: { status }
    });
  } catch (error) {
    // P2025: không tìm thấy bản ghi để cập nhật
    if (error.code === 'P2025') {
      throw fail(404, `Không tìm thấy vận đơn với ID ${id}!`);
    }
    throw error;
  }
};