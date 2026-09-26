const jwt = require('jsonwebtoken');

// Middleware xác thực JWT Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Dạng: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy Token xác thực!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
    req.user = user; // Lưu thông tin user decoded (uid, roleid, ...)
    next();
  });
};

// Middleware kiểm tra quyền Admin (Ví dụ: roleid = 1 là Admin)
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.roleid === 1) {
    next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối! Yêu cầu quyền Admin.' });
  }
};

module.exports = { authenticateToken, requireAdmin };