const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Đăng ký tài khoản thành công!', user });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error('register error:', error);
    res.status(status).json({
      message: status === 500 ? 'Lỗi máy chủ!' : error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({ message: 'Đăng nhập thành công!', token, user });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error('login error:', error);
    res.status(status).json({
      message: status === 500 ? 'Lỗi máy chủ!' : error.message
    });
  }
};