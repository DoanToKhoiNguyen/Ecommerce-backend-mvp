const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const DEFAULT_ROLE_ID = 2;   // User thường
const DEFAULT_MEMBER_ID = 1; // Hạng mặc định

exports.register = async ({ username, fullname, password }) => {
  if (!username || !fullname || !password) {
    throw fail(400, 'Thiếu username, fullname hoặc password!');
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    throw fail(400, 'Tên đăng nhập đã tồn tại!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      fullname,
      password: hashedPassword,
      roleid: DEFAULT_ROLE_ID,
      mid: DEFAULT_MEMBER_ID
    }
  });

  return { uid: newUser.uid, username: newUser.username, fullname: newUser.fullname };
};

exports.login = async ({ username, password }) => {
  if (!username || !password) {
    throw fail(400, 'Thiếu username hoặc password!');
  }

  const user = await prisma.user.findUnique({ where: { username } });
  const isValid = user && (await bcrypt.compare(password, user.password));
  if (!isValid) {
    throw fail(401, 'Tên đăng nhập hoặc mật khẩu không đúng!');
  }

  const token = jwt.sign(
    { uid: user.uid, roleid: user.roleid },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    token,
    user: { uid: user.uid, username: user.username, fullname: user.fullname, roleid: user.roleid }
  };
};