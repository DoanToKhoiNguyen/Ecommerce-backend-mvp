const prisma = require('../config/db');

const fail = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

exports.createOrder = async (uid, items) => {
    if(!Array.isArray(items) || items.length === 0){
        throw fail (400, 'Đơn hàng không có sản phẩm');
    }

    return prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({ data: { uid } });

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

      const updated = await tx.product.updateMany({
        where: { pid: product.pid, quantity: { gte: qty } },
        data: { quantity: { decrement: qty } }
      });
      if (updated.count === 0) {
        throw fail(400, `Sản phẩm "${product.pname}" không đủ tồn kho!`);
      }

      await tx.orderDetail.create({
        data: {
          oid: newOrder.oid,
          pid: product.pid,
          qty,
          unit_price: product.price.mul(qty)
        }
      });
    }

    await tx.shipment.create({
      data: { oid: newOrder.oid, status: 'Pending' }
    });

    return newOrder;
  });
};

exports.getOrdersByUser = (uid) => {
  return prisma.order.findMany({
    where: { uid: Number(uid) },
    include: {
      user: { select: { fullname: true } },
      orderDetails: {
        include: {
          product: { select: { pid: true, pname: true, price: true } }
        }
      },
      shipments: true
    }
  });
};
