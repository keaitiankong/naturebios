const express = require('express');
const router = express.Router();
const { Product, Category, User, Literature, Log } = require('../models');
const { authenticate, authorize, checkPermission, generateToken } = require('../middleware/auth');
const SearchService = require('../services/searchService');
const BulkImportService = require('../services/bulkImportService');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// ==================== 公开API ====================

// 搜索产品
router.get('/products/search', async (req, res) => {
  try {
    const result = await SearchService.search(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取搜索建议
router.get('/products/suggestions', async (req, res) => {
  try {
    const { keyword } = req.query;
    const suggestions = await SearchService.getSuggestions(keyword);
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取热门产品
router.get('/products/popular', async (req, res) => {
  try {
    const products = await SearchService.getPopularSearches(10);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取产品详情
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }
    
    // 增加浏览量
    await product.increment('viewCount');
    
    // 获取相关产品
    const related = await SearchService.getRelatedProducts(product.id);
    
    res.json({ product, related });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取产品列表
router.get('/products', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 20 } = req.query;
    const where = { status: 'published' };
    
    if (category) {
      where.category = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      attributes: ['id', 'sku', 'name', 'nameEn', 'category', 'templateType', 'images', '价格', '库存', 'host', 'clonality', 'species'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取分类列表
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null },
      include: [{ model: Category, as: 'children' }],
      order: [['sortOrder', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取文献列表
router.get('/literatures', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const { count, rows } = await Literature.findAndCountAll({
      where: { status: 'approved' },
      order: [['pubDate', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 管理API（需登录） ====================

// 登录
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: '账户已被禁用' });
    }

    // 更新最后登录
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前用户信息
router.get('/auth/me', authenticate, async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// ==================== 产品管理 ====================

// 创建产品
router.post('/admin/products', authenticate, async (req, res) => {
  try {
    if (!checkPermission.canCreateProduct(req.user)) {
      return res.status(403).json({ error: '权限不足' });
    }

    const product = await Product.create({
      ...req.body,
      createdBy: req.userId
    });

    // 记录日志
    await Log.create({
      userId: req.userId,
      action: 'create',
      target: 'product',
      targetId: product.id,
      details: { name: product.name },
      ip: req.ip
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新产品
router.put('/admin/products/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }

    if (!checkPermission.canUpdateProduct(req.user, product)) {
      return res.status(403).json({ error: '权限不足' });
    }

    await product.update(req.body);

    // 记录日志
    await Log.create({
      userId: req.userId,
      action: 'update',
      target: 'product',
      targetId: product.id,
      details: req.body,
      ip: req.ip
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除产品
router.delete('/admin/products/:id', authenticate, async (req, res) => {
  try {
    if (!checkPermission.canDeleteProduct(req.user)) {
      return res.status(403).json({ error: '权限不足' });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '产品不存在' });
    }

    await product.destroy();

    // 记录日志
    await Log.create({
      userId: req.userId,
      action: 'delete',
      target: 'product',
      targetId: req.params.id,
      ip: req.ip
    });

    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量导入产品
router.post('/admin/products/import', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!checkPermission.canCreateProduct(req.user)) {
      return res.status(403).json({ error: '权限不足' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const { updateExisting } = req.body;
    const results = await BulkImportService.importFromExcel(
      req.file.path,
      { updateExisting: updateExisting === 'true' }
    );

    // 记录日志
    await Log.create({
      userId: req.userId,
      action: 'import',
      target: 'product',
      details: results,
      ip: req.ip
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量更新
router.post('/admin/products/bulk-update', authenticate, async (req, res) => {
  try {
    if (!checkPermission.canCreateProduct(req.user)) {
      return res.status(403).json({ error: '权限不足' });
    }

    const { ids, updates } = req.body;
    const results = await BulkImportService.bulkUpdate(ids, updates);

    // 记录日志
    await Log.create({
      userId: req.userId,
      action: 'bulk_update',
      target: 'product',
      details: { count: results.success },
      ip: req.ip
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量删除
router.post('/admin/products/bulk-delete', authenticate, async (req, res) => {
  try {
    if (!checkPermission.canDeleteProduct(req.user)) {
      return res.status(403).json({ error: '权限不足' });
    }

    const { ids } = req.body;
    const count = await BulkImportService.bulkDelete(ids);

    // 记录日志
    await Log.create({
      userId: req.userId,
      action: 'bulk_delete',
      target: 'product',
      details: { count },
      ip: req.ip
    });

    res.json({ message: '删除成功', count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取导入模板
router.get('/admin/products/template', authenticate, async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../../uploads/template.xlsx');
    BulkImportService.generateTemplate(templatePath);
    res.download(templatePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 用户管理（仅管理员） ====================

// 获取用户列表
router.get('/admin/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'name', 'email', 'role', 'status', 'lastLogin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建用户
router.post('/admin/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { password, ...userData } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新用户
router.put('/admin/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const { password, ...updateData } = req.body;
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 删除用户
router.delete('/admin/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能删除自己
    if (user.id === req.userId) {
      return res.status(400).json({ error: '不能删除自己的账户' });
    }

    await user.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 统计API ====================

// 获取统计数据
router.get('/admin/stats', authenticate, async (req, res) => {
  try {
    const productCount = await Product.count();
    const categoryCount = await Category.count();
    const userCount = await User.count({ where: { status: 'active' });

    // 最近7天产品新增
    const recentProducts = await Product.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      productCount,
      categoryCount,
      userCount,
      recentProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取操作日志
router.get('/admin/logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query;
    const { count, rows } = await Log.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      list: rows,
      total: count,
      page: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
