const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

// 用户模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'sub_admin'),
    defaultValue: 'sub_admin'
  },
  name: {
    type: DataTypes.STRING(100)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  timestamps: true
});

// 产品模型 - 支持13000+产品
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sku: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nameEn: {
    type: DataTypes.STRING(255)
  },
  category: {
    type: DataTypes.ENUM('primary_antibody', 'secondary_antibody', 'biochemical', 'kit', 'control', 'phospho'),
    allowNull: false
  },
  templateType: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E'),
    defaultValue: 'A'
  },
  // 基本信息
  description: {
    type: DataTypes.TEXT
  },
  descriptionEn: {
    type: DataTypes.TEXT
  },
  applications: {
    type: DataTypes.JSON // IF, IHC, WB, ELISA, IP, Flow Cyt等
  },
  species: {
    type: DataTypes.JSON // human, mouse, rat等
  },
  host: {
    type: DataTypes.STRING(50) // Rabbit, Mouse, Goat等
  },
  clonality: {
    type: DataTypes.ENUM('monoclonal', 'polyclonal')
  },
  // 详细信息（30+字段）
  geneName: {
    type: DataTypes.STRING(100)
  },
  geneSymbol: {
    type: DataTypes.STRING(50)
  },
  uniprotId: {
    type: DataTypes.STRING(20)
  },
  ensemblId: {
    type: DataTypes.STRING(50)
  },
  molecularWeight: {
    type: DataTypes.STRING(50)
  },
  immunogen: {
    type: DataTypes.TEXT
  },
  concentration: {
    type: DataTypes.STRING(50)
  },
  purity: {
    type: DataTypes.STRING(50)
  },
  formulation: {
    type: DataTypes.TEXT
  },
  storage: {
    type: DataTypes.STRING(100)
  },
  reactivity: {
    type: DataTypes.JSON
  },
  // 修饰信息（磷酸化等）
  modification: {
    type: DataTypes.JSON // ser, tyr, thr等
  },
  phosphorylationSite: {
    type: DataTypes.STRING(100)
  },
  // 检测信息
  detectedSpecies: {
    type: DataTypes.JSON
  },
  recommendedDilution: {
    type: DataTypes.STRING(100)
  },
  incubationTime: {
    type: DataTypes.STRING(100)
  },
  // 包装信息
 规格: {
    type: DataTypes.STRING(100)
  },
  价格: {
    type: DataTypes.DECIMAL(10, 2)
  },
  库存: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 文献引用
  citations: {
    type: DataTypes.JSON
  },
  // 图像
  images: {
    type: DataTypes.JSON
  },
  datasheet: {
    type: DataTypes.STRING(255)
  },
  // 状态
  status: {
    type: DataTypes.ENUM('published', 'draft', 'archived'),
    defaultValue: 'draft'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['sku'] },
    { fields: ['category'] },
    { fields: ['templateType'] },
    { fields: ['status'] },
    { fields: ['name'] },
    { fields: ['geneSymbol'] },
    { fields: ['uniprotId'] }
  ]
});

// 产品分类
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nameEn: {
    type: DataTypes.STRING(100)
  },
  slug: {
    type: DataTypes.STRING(100),
    unique: true
  },
  parentId: {
    type: DataTypes.UUID
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  icon: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'categories'
});

// 文献/论文引用
const Literature = sequelize.define('Literature', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  authors: {
    type: DataTypes.TEXT
  },
  journal: {
    type: DataTypes.STRING(200)
  },
  doi: {
    type: DataTypes.STRING(100)
  },
  pubDate: {
    type: DataTypes.DATE
  },
  productIds: {
    type: DataTypes.JSON
  },
  institution: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'literatures'
});

// 操作日志
const Log = sequelize.define('Log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID
  },
  action: {
    type: DataTypes.STRING(50)
  },
  target: {
    type: DataTypes.STRING(50)
  },
  targetId: {
    type: DataTypes.STRING(50)
  },
  details: {
    type: DataTypes.JSON
  },
  ip: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'logs'
});

// 关联
User.hasMany(Product, { foreignKey: 'createdBy' });
Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = {
  User,
  Product,
  Category,
  Literature,
  Log,
  sequelize
};
