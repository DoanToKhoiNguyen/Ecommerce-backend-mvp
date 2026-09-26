const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { username, fullname, password, roleid, mid } = req.body;

    // Kiểm tra trùng username
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        fullname,
        password: hashedPassword,
        roleid: roleid || 2, // Mặc định roleid = 2 (User thường)
        mid: mid || 1        // Mặc định mid = 1 (Hạng mặc định)
      }
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: { uid: newUser.uid, username: newUser.username, fullname: newUser.fullname }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ!', error: error.message });
  }
};

// Đăng nhập & Tạo Token JWT
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
    }

    // Tạo JWT Token chứa uid và roleid
    const token = jwt.sign(
      { uid: user.uid, roleid: user.roleid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: { uid: user.uid, username: user.username, fullname: user.fullname, roleid: user.roleid }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ!', error: error.message });
  }
};