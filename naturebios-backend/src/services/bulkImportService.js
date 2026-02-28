const XLSX = require('xlsx');
const { Product, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * 批量导入服务
 */
class BulkImportService {

  /**
   * 从Excel文件导入产品
   */
  static async importFromExcel(filePath, options = {}) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
      skipped: 0
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];
        
        // 检查必填字段
        if (!row.sku || !row.name || !row.category) {
          results.skipped++;
          results.errors.push(`行${i + 2}: 缺少必填字段(sku/name/category)`);
          continue;
        }

        // 检查SKU是否已存在
        const existing = await Product.findOne({ where: { sku: row.sku } });
        if (existing && !options.updateExisting) {
          results.skipped++;
          continue;
        }

        // 处理JSON字段
        const productData = this.processRowData(row);

        if (existing) {
          await existing.update(productData);
        } else {
          await Product.create(productData);
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`行${i + 2}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * 处理行数据
   */
  static processRowData(row) {
    // JSON字段处理
    const jsonFields = ['applications', 'species', 'reactivity', 'modification', 'citations', 'images'];
    
    const data = {};
    for (const [key, value] of Object.entries(row)) {
      if (jsonFields.includes(key)) {
        // 尝试解析JSON，否则尝试按逗号分隔
        try {
          data[key] = value ? JSON.parse(value) : [];
        } catch {
          data[key] = value ? value.split(',').map(s => s.trim()) : [];
        }
      } else if (key === '价格' || key === 'price') {
        data['价格'] = parseFloat(value) || 0;
      } else if (key === '库存' || key === 'stock') {
        data['库存'] = parseInt(value) || 0;
      } else if (key === 'concentration') {
        data['concentration'] = String(value);
      } else {
        data[key] = value;
      }
    }

    // 映射分类
    const categoryMap = {
      '一抗': 'primary_antibody',
      '二抗': 'secondary_antibody',
      '生化试剂': 'biochemical',
      '试剂盒': 'kit',
      '内参对照': 'control',
      '磷酸化抗体': 'phospho',
      'primary_antibody': 'primary_antibody',
      'secondary_antibody': 'secondary_antibody',
      'biochemical': 'biochemical',
      'kit': 'kit',
      'control': 'control',
      'phospho': 'phospho'
    };
    
    if (data.category && categoryMap[data.category]) {
      data.category = categoryMap[data.category];
    }

    // 映射模板类型
    const templateMap = {
      'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E',
      '普通抗体': 'A',
      '试剂盒': 'B',
      '生化试剂': 'C',
      '内参对照': 'D',
      '磷酸化抗体': 'E'
    };
    
    data.templateType = templateMap[data.templateType] || 'A';

    return data;
  }

  /**
   * 批量修改
   */
  static async bulkUpdate(ids, updates) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // 处理JSON字段
    const updateData = {};
    for (const [key, value] of Object.entries(updates)) {
      if (['applications', 'species', 'modification'].includes(key)) {
        try {
          updateData[key] = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          updateData[key] = value.split ? value.split(',').map(s => s.trim()) : value;
        }
      } else if (key === '价格') {
        updateData['价格'] = parseFloat(value);
      } else if (key === '库存') {
        updateData['库存'] = parseInt(value);
      } else {
        updateData[key] = value;
      }
    }

    for (const id of ids) {
      try {
        await Product.update(updateData, { where: { id } });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`ID ${id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * 批量删除
   */
  static async bulkDelete(ids) {
    return await Product.destroy({ where: { id: ids } });
  }

  /**
   * 批量设置状态
   */
  static async bulkSetStatus(ids, status) {
    return await Product.update({ status }, { where: { id: ids } });
  }

  /**
   * 导出产品到Excel
   */
  static async exportToExcel(productIds = null, filePath) {
    const where = productIds ? { id: productIds } : {};
    const products = await Product.findAll({ where });

    const data = products.map(p => {
      const item = p.toJSON();
      
      // 转换JSON字段为字符串
      const jsonFields = ['applications', 'species', 'reactivity', 'modification', 'citations', 'images'];
      for (const field of jsonFields) {
        if (item[field] && typeof item[field] === 'object') {
          item[field] = JSON.stringify(item[field]);
        }
      }

      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, filePath);

    return { count: data.length, path: filePath };
  }

  /**
   * 生成导入模板
   */
  static generateTemplate(filePath) {
    const template = [
      {
        sku: 'NB-001',
        name: '示例产品名称',
        nameEn: 'Sample Product Name',
        category: 'primary_antibody',
        templateType: 'A',
        description: '产品描述',
        geneSymbol: 'GAPDH',
        geneName: 'Glyceraldehyde-3-phosphate dehydrogenase',
        uniprotId: 'P04406',
        host: 'Rabbit',
        clonality: 'monoclonal',
        applications: 'WB,IHC,IF',
        species: 'human,mouse,rat',
        molecularWeight: '36kDa',
        concentration: '1mg/ml',
        purity: '>95%',
        价格: 999.00,
        库存: 100
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, filePath);

    return filePath;
  }
}

module.exports = BulkImportService;
