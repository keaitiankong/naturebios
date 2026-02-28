const { Op } = require('sequelize');
const { Product, Category } = require('../models');

/**
 * 智能搜索服务 - 相关度排序
 * 支持：关键词、分类、属性筛选
 */
class SearchService {
  
  /**
   * 主搜索函数
   * @param {Object} params - 搜索参数
   * @returns {Promise} 搜索结果
   */
  static async search(params) {
    const {
      keyword = '',
      category,
      species,
      application,
      host,
      clonality,
      modification,
      minPrice,
      maxPrice,
      inStock,
      page = 1,
      pageSize = 20,
      sortBy = 'relevance' // relevance, price_asc, price_desc, newest, popular
    } = params;

    const where = { status: 'published' };
    const order = [];
    
    // 关键词搜索 - 智能分词 + 相关度
    if (keyword) {
      const keywords = this.tokenize(keyword);
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { nameEn: { [Op.like]: `%${keyword}%` } },
        { sku: { [Op.like]: `%${keyword}%` } },
        { geneName: { [Op.like]: `%${keyword}%` } },
        { geneSymbol: { [Op.like]: `%${keyword}%` } },
        { uniprotId: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 物种筛选
    if (species) {
      where.species = {
        [Op.contains]: species
      };
    }

    // 应用筛选
    if (application) {
      where.applications = {
        [Op.contains]: application
      };
    }

    // 宿主筛选
    if (host) {
      where.host = host;
    }

    // 克隆性筛选
    if (clonality) {
      where.clonality = clonality;
    }

    // 修饰类型筛选
    if (modification) {
      where.modification = {
        [Op.contains]: modification
      };
    }

    // 价格筛选
    if (minPrice || maxPrice) {
      where.价格 = {};
      if (minPrice) where.价格[Op.gte] = minPrice;
      if (maxPrice) where.价格[Op.lte] = maxPrice;
    }

    // 库存筛选
    if (inStock) {
      where.库存 = { [Op.gt]: 0 };
    }

    // 排序
    switch (sortBy) {
      case 'price_asc':
        order.push(['价格', 'ASC']);
        break;
      case 'price_desc':
        order.push(['价格', 'DESC']);
        break;
      case 'newest':
        order.push(['createdAt', 'DESC']);
        break;
      case 'popular':
        order.push(['viewCount', 'DESC']);
        break;
      default:
        // relevance - 关键词匹配度优先
        if (keyword) {
          order.push([
            sequelize.literal(`
              CASE 
                WHEN sku LIKE '${keyword}%' THEN 1
                WHEN name LIKE '${keyword}%' THEN 2
                WHEN geneSymbol LIKE '${keyword}%' THEN 3
                WHEN nameEn LIKE '${keyword}%' THEN 4
                ELSE 5
              END
            `),
            'ASC'
          ]);
        }
    }

    // 分页
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit,
      offset,
      attributes: { exclude: ['immunogen', 'formulation'] }
    });

    // 计算相关度分数（用于前端显示）
    const results = rows.map(product => {
      const data = product.toJSON();
      data.relevanceScore = this.calculateRelevance(keyword, data);
      return data;
    });

    // 如果有关键词，重新按相关度排序
    if (keyword && results.length > 1) {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    return {
      list: results,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  /**
   * 智能分词 - 支持中英文混合
   */
  static tokenize(text) {
    const chinese = text.match(/[\u4e00-\u9fa5]+/g) || [];
    const english = text.match(/[a-zA-Z0-9]+/g) || [];
    return [...chinese, ...english];
  }

  /**
   * 计算相关度分数
   */
  static calculateRelevance(keyword, product) {
    if (!keyword) return 100;
    
    let score = 0;
    const lowerKeyword = keyword.toLowerCase();

    // SKU精确匹配 - 最高优先级
    if (product.sku && product.sku.toLowerCase().includes(lowerKeyword)) {
      score += 100;
      if (product.sku.toLowerCase().startsWith(lowerKeyword)) score += 50;
    }

    // 基因符号匹配
    if (product.geneSymbol && product.geneSymbol.toLowerCase().includes(lowerKeyword)) {
      score += 80;
    }

    // 名称匹配
    if (product.name && product.name.toLowerCase().includes(lowerKeyword)) {
      score += 60;
      if (product.name.toLowerCase().startsWith(lowerKeyword)) score += 30;
    }

    // 英文名匹配
    if (product.nameEn && product.nameEn.toLowerCase().includes(lowerKeyword)) {
      score += 50;
    }

    // UNIPROT ID匹配
    if (product.uniprotId && product.uniprotId.toLowerCase() === lowerKeyword) {
      score += 70;
    }

    // 描述匹配
    if (product.description && product.description.toLowerCase().includes(lowerKeyword)) {
      score += 30;
    }

    // 热门产品加分
    if (product.viewCount > 1000) score += 10;
    if (product.isFeatured) score += 20;

    // 文献引用加分
    if (product.citations && product.citations.length > 0) {
      score += product.citations.length * 5;
    }

    return score;
  }

  /**
   * 获取搜索建议（自动补全）
   */
  static async getSuggestions(keyword, limit = 10) {
    if (!keyword || keyword.length < 2) return [];

    const products = await Product.findAll({
      where: {
        status: 'published',
        [Op.or]: [
          { name: { [Op.like]: `${keyword}%` } },
          { sku: { [Op.like]: `${keyword}%` } },
          { geneSymbol: { [Op.like]: `${keyword}%` } }
        ]
      },
      attributes: ['id', 'sku', 'name', 'nameEn', 'category'],
      limit,
      order: [
        ['viewCount', 'DESC'],
        ['name', 'ASC']
      ]
    });

    return products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      nameEn: p.nameEn,
      category: p.category,
      type: p.sku.startsWith(keyword.toUpperCase()) ? 'sku' : 'name'
    }));
  }

  /**
   * 获取相关产品推荐
   */
  static async getRelatedProducts(productId, limit = 6) {
    const product = await Product.findByPk(productId);
    if (!product) return [];

    // 基于相同分类、物种、应用的推荐
    const where = {
      status: 'published',
      id: { [Op.ne]: productId }
    };

    if (product.category) where.category = product.category;

    const related = await Product.findAll({
      where,
      attributes: ['id', 'sku', 'name', 'nameEn', 'category', 'images', '价格', '库存'],
      order: [['viewCount', 'DESC']],
      limit
    });

    return related;
  }

  /**
   * 获取热门搜索
   */
  static async getPopularSearches(limit = 10) {
    return Product.findAll({
      where: { status: 'published' },
      attributes: ['id', 'sku', 'name', 'viewCount'],
      order: [['viewCount', 'DESC']],
      limit
    });
  }
}

module.exports = SearchService;
