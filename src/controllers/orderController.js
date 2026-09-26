const prisma = require('../config/db');

// Khách hàng tạo đơn hàng
exports.createOrder = async (req, res) => {
  try {
    const uid = req.user.uid; // Lấy từ JWT token
    const { items } = req.body; // Array: [{ pid, qty, unit_price }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Đơn hàng không có sản phẩm!' });
    }

    // Dùng Transaction để đảm bảo tính toàn vẹn dữ liệu
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo Order
      const order = await tx.order.create({
        data: { uid, createat: new Date() }
      });

      // 2. Tạo các OrderDetail
      const orderDetailsData = items.map(item => ({
        oid: order.oid,
        pid: item.pid,
        qty: item.qty,
        unit_price: item.unit_price
      }));

      await tx.orderDetail.createMany({ data: orderDetailsData });

      // 3. Khởi tạo bản ghi Shipment (Trạng thái chờ)
      await tx.shipment.create({
        data: { oid: order.oid, status: 'Pending' }
      });

      return order;
    });

    res.status(201).json({ message: 'Đặt hàng thành công!', orderId: result.oid });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo đơn hàng!', error: error.message });
  }
};

// Xem lịch sử đơn hàng của cá nhân
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.uid; // Lấy ID người dùng từ Token

    const orders = await prisma.order.findMany({
      where: {
        uid: parseInt(userId)
      },
      include: {
        orderDetails: { // Sửa OrderDetail thành orderDetails
          include: {
            product: true // Hoặc Product (tùy theo tên model trong schema của bạn)
          }
        },
        shipments: true // Sửa Shipment thành shipments
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};