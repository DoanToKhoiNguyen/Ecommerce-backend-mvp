const prisma = require('../config/db');

// Hàm hỗ trợ format thời gian sang định dạng Việt Nam (giờ 24h)
const formatToVNTime = (dateInput) => {
  if (!dateInput) return null;
  return new Date(dateInput).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false
  });
};

exports.createOrder = async (req, res) => {
  try {
    const uid = req.user.uid;
    const items = req.body.items;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Đơn hàng không có sản phẩm!' });
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1. Tạo Order trước
      const newOrder = await tx.order.create({
        data: { uid }
      });

      // 2. Vòng lặp thêm từng OrderDetail và lấy giá từ Product
      for (const item of items) {
        const qty = Number(item.qty);
        if (!Number.isInteger(qty) || qty <= 0) {
          throw fail(400, 'qty phải là số nguyên dương!');
        }

        const product = await tx.product.findUnique({
          where: { pid: Number(item.pid) }
        });

        if (!product) {
          throw fail(404, `Sản phẩm với ID ${item.pid} không tồn tại!`);
        }

        // >>> PHẦN MỚI: trừ tồn kho, chỉ trừ khi còn đủ hàng
        const updated = await tx.product.updateMany({
          where: { pid: product.pid, quantity: { gte: qty } },
          data: { quantity: { decrement: qty } }
        });
        if (updated.count === 0) {
          throw fail(400, `Sản phẩm "${product.pname}" không đủ tồn kho!`);
        }
        // <<< HẾT PHẦN MỚI

        await tx.orderDetail.create({
          data: {
            oid: newOrder.oid,
            pid: product.pid,
            qty,
            unit_price: product.price.mul(qty)
          }
        });
      }

      // 3. Khởi tạo bản ghi Shipment (Trạng thái chờ)
      await tx.shipment.create({
        data: {
          oid: newOrder.oid,
          status: 'Pending'
        }
      });

      return newOrder;
    });

    res.status(201).json({
      message: 'Đặt hàng thành công!',
      orderId: order.oid,
      createat: formatToVNTime(new Date())
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      message: status === 500 ? 'Lỗi tạo đơn hàng!' : error.message
    });
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
        user: {
          select: {fullname: true}
        },
        orderDetails: {
          include: {
            product: {
              select: { pid: true, pname: true, price: true } // ẩn quantity (tồn kho)
            }
          }
        },
        shipments: true
      }
    });

    const formattedOrders = orders.map(({ user, ...order }) => ({
      oid: order.oid,
      customer: user.fullname,
      createat: formatToVNTime(order.createat),
      total: order.orderDetails.reduce(
      (sum, d) => sum + Number(d.unit_price) * d.qty, 0
      ),
      orderDetails: order.orderDetails.map(item => {
        return {
        oid: item.oid,
        pid: item.pid,
        qty: item.qty,
        product: item.product,
        sum: Number(item.unit_price) * item.qty
        };
      }),
      shipments: order.shipments
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};