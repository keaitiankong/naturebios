require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./src/models');

const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/backup', express.static(path.join(__dirname, 'backup')));

// API路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 初始化数据库并启动
async function start() {
  try {
    // 同步数据库
    await sequelize.sync({ alter: true });
    console.log('✓ 数据库连接成功');

    // 创建默认管理员账户
    const { User } = require('./src/models');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        name: '系统管理员',
        email: 'admin@naturebios.cn',
        role: 'admin'
      });
      console.log('✓ 默认管理员账户已创建');
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║   🌿 Nature Biosciences API Server                 ║
║   运行地址: http://localhost:${PORT}                 ║
║                                                    ║
║   默认管理员: admin / admin123                     ║
║                                                    ║
╚════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

start();
