const orderService = require('../services/orderService');

const formatToVNTime = (dateInput) => {
  if (!dateInput) return null;
  return new Date(dateInput).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false
  });
};

exports.createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.uid, req.body.items);

    res.status(201).json({
      message: 'Đặt hàng thành công!',
      orderId: order.oid,
      createat: formatToVNTime(order.createat)
    });
  } catch (error) {
      console.error('createOrder error:', error);   // THÊM DÒNG NÀY
      const status = error.status || 500;
      res.status(status).json({
        message: status === 500 ? 'Lỗi tạo đơn hàng!' : error.message
      });
    }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user.uid);

    const result = orders.map(({ user, ...order }) => ({
      oid: order.oid,
      customer: user.fullname,
      createat: formatToVNTime(order.createat),
      total: order.orderDetails.reduce((sum, d) => sum + Number(d.unit_price), 0),
      orderDetails: order.orderDetails.map((item) => ({
        oid: item.oid,
        pid: item.pid,
        qty: item.qty,
        product: item.product,
        sum: Number(item.unit_price)
      })),
      shipments: order.shipments
    }));

    res.status(200).json(result);
  } catch (error) {
      console.error('createOrder error:', error);   // THÊM DÒNG NÀY
      const status = error.status || 500;
      res.status(status).json({
        message: status === 500 ? 'Lỗi tạo đơn hàng!' : error.message
      });
    }
};