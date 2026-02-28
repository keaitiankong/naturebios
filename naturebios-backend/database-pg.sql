-- Nature Biosciences PostgreSQL 数据库初始化脚本

-- 创建数据库 (在 psql 中执行: CREATE DATABASE naturebios;)

\c naturebios;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  role VARCHAR(20) DEFAULT 'sub_admin',
  name VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  lastLogin TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nameEn VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  parentId VARCHAR(36),
  sortOrder INT DEFAULT 0,
  icon VARCHAR(50),
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES categories(id)
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  nameEn VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  templateType VARCHAR(10) DEFAULT 'A',
  description TEXT,
  descriptionEn TEXT,
  applications JSONB,
  species JSONB,
  host VARCHAR(50),
  clonality VARCHAR(20),
  geneName VARCHAR(100),
  geneSymbol VARCHAR(50),
  uniprotId VARCHAR(20),
  ensemblId VARCHAR(50),
  molecularWeight VARCHAR(50),
  immunogen TEXT,
  concentration VARCHAR(50),
  purity VARCHAR(50),
  formulation TEXT,
  storage VARCHAR(100),
  reactivity JSONB,
  modification JSONB,
  phosphorylationSite VARCHAR(100),
  detectedSpecies JSONB,
  recommendedDilution VARCHAR(100),
  incubationTime VARCHAR(100),
  "规格" VARCHAR(100),
  "价格" DECIMAL(10,2),
  "库存" INT DEFAULT 0,
  citations JSONB,
  images JSONB,
  datasheet VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  isFeatured BOOLEAN DEFAULT FALSE,
  viewCount INT DEFAULT 0,
  createdBy VARCHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- 创建文献表
CREATE TABLE IF NOT EXISTS literatures (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  authors TEXT,
  journal VARCHAR(200),
  doi VARCHAR(100),
  pubDate TIMESTAMP,
  productIds JSONB,
  institution VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建日志表
CREATE TABLE IF NOT EXISTS logs (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36),
  action VARCHAR(50),
  target VARCHAR(50),
  targetId VARCHAR(50),
  details JSONB,
  ip VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- 创建索引
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_template ON products(templateType);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_genesymbol ON products(geneSymbol);
CREATE INDEX idx_products_uniprot ON products(uniprotId);

-- 插入默认管理员账户 (密码: admin123)
INSERT INTO users (id, username, password, name, email, role, status)
VALUES (
  'admin-001',
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye4qDy7iRKKF1p1p5MN5WbKyq1Z5Q8aW',
  '系统管理员',
  'admin@naturebios.cn',
  'admin',
  'active'
) ON CONFLICT (username) DO NOTHING;

-- 插入默认分类
INSERT INTO categories (id, name, nameEn, slug, sortOrder) VALUES
('cat-001', '一抗', 'Primary Antibodies', 'primary-antibody', 1),
('cat-002', '二抗', 'Secondary Antibodies', 'secondary-antibody', 2),
('cat-003', '生化试剂', 'Biochemical Reagents', 'biochemical', 3),
('cat-004', '试剂盒', 'Kits', 'kits', 4),
('cat-005', '内参对照', 'Loading Controls', 'controls', 5),
('cat-006', '磷酸化抗体', 'Phospho Antibodies', 'phospho-antibodies', 6)
ON CONFLICT (slug) DO NOTHING;

-- 示例产品数据
INSERT INTO products (id, sku, name, nameEn, category, templateType, host, clonality, geneSymbol, geneName, uniprotId, molecularWeight, "价格", "库存", status) VALUES
(gen_random_uuid(), 'NB-1001', 'GAPDH Mouse Monoclonal Antibody', '甘油醛-3-磷酸脱氢酶小鼠单克隆抗体', 'primary_antibody', 'A', 'Mouse', 'monoclonal', 'GAPDH', 'Glyceraldehyde-3-phosphate dehydrogenase', 'P04406', '36kDa', 899.00, 100, 'published'),
(gen_random_uuid(), 'NB-1002', 'β-Actin Rabbit Polyclonal Antibody', 'β-肌动蛋白兔多克隆抗体', 'primary_antibody', 'A', 'Rabbit', 'polyclonal', 'ACTB', 'Beta-actin', 'P60709', '42kDa', 799.00, 150, 'published'),
(gen_random_uuid(), 'NB-2001', 'HRP Goat Anti-Rabbit IgG', '辣根过氧化物酶标记山羊抗兔IgG', 'secondary_antibody', 'A', 'Goat', 'polyclonal', '-', '-', '-', '-', 399.00, 200, 'published'),
(gen_random_uuid(), 'NB-3001', 'ELISA Kit for Human IL-6', '人白细胞介素6 ELISA试剂盒', 'kit', 'B', '-', '-', 'IL6', 'Interleukin-6', '-', '-', 2680.00, 50, 'published'),
(gen_random_uuid(), 'NB-4001', 'BCA Protein Assay Kit', 'BCA蛋白定量试剂盒', 'kit', 'B', '-', '-', '-', '-', '-', '-', 1580.00, 80, 'published')
ON CONFLICT (sku) DO NOTHING;
