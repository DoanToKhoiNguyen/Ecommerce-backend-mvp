const prisma = require('../config/db');

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

exports.getAllProducts = () => {
  return prisma.product.findMany();
};

exports.createProduct = async ({ pname, price, quantity }) => {
  if (!pname || typeof pname !== 'string' || !pname.trim()) {
    throw fail(400, 'Tên sản phẩm không hợp lệ!');
  }

  const parsedPrice = Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw fail(400, 'Giá sản phẩm phải là số không âm!');
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    throw fail(400, 'Số lượng phải là số nguyên không âm!');
  }

  return prisma.product.create({
    data: {
      pname: pname.trim(),
      price: parsedPrice,
      quantity: parsedQuantity
    }
  });
};