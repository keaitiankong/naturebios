const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'naturebios-secret-key-2026';

/**
 * 认证中间件 - 验证用户登录状态
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '请先登录' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: '用户不存在或已禁用' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
};

/**
 * 权限中间件 - 检查用户角色
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};

/**
 * 权限检查辅助函数
 */
const checkPermission = {
  // 产品权限
  canCreateProduct: (user) => {
    return user.role === 'admin';
  },
  
  canUpdateProduct: (user, product) => {
    if (user.role === 'admin') return true;
    if (user.role === 'sub_admin' && product.createdBy === user.id) return true;
    return false;
  },
  
  canDeleteProduct: (user) => {
    return user.role === 'admin';
  },
  
  // 用户管理权限
  canManageUsers: (user) => {
    return user.role === 'admin';
  },
  
  // 订单权限
  canViewAllOrders: (user) => {
    return user.role === 'admin';
  },
  
  // 文献权限
  canManageLiterature: (user) => {
    return user.role === 'admin';
  },
  
  // 系统设置权限
  canAccessSettings: (user) => {
    return user.role === 'admin';
  }
};

/**
 * 生成Token
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  generateToken,
  JWT_SECRET
};
