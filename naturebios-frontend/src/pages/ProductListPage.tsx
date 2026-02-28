import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, bulkDeleteProducts, bulkUpdateProducts, importProducts } from '../services/api';
import { Product } from '../types';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ category: '', status: '', keyword: '' });
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [pagination.page, filters.category, filters.status]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.keyword) params.keyword = filters.keyword;

      const data = await getProducts(params);
      setProducts(data.list || []);
      setPagination(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(products.map(p => p.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selected.length} 个产品吗？`)) return;
    try {
      await bulkDeleteProducts(selected);
      setSelected([]);
      loadProducts();
    } catch (error) {
      alert('批量删除失败');
    }
  };

  const handleBulkStatus = async (status: 'published' | 'draft' | 'archived') => {
    if (selected.length === 0) return;
    try {
      await bulkUpdateProducts(selected, { status });
      setSelected([]);
      loadProducts();
    } catch (error) {
      alert('批量更新失败');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const result = await importProducts(file, true);
      alert(`导入完成：成功 ${result.success}，失败 ${result.failed}，跳过 ${result.skipped}`);
      loadProducts();
    } catch (error) {
      alert('导入失败');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const categories = [
    { value: '', label: '全部分类' },
    { value: 'primary_antibody', label: '一抗' },
    { value: 'secondary_antibody', label: '二抗' },
    { value: 'biochemical', label: '生化试剂' },
    { value: 'kit', label: '试剂盒' },
    { value: 'control', label: '内参对照' },
    { value: 'phospho', label: '磷酸化抗体' },
  ];

  const statuses = [
    { value: '', label: '全部状态' },
    { value: 'published', label: '已发布' },
    { value: 'draft', label: '草稿' },
    { value: 'archived', label: '已归档' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">产品管理</h1>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
            {importing ? '导入中...' : '批量导入'}
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
          </label>
          <Link to="/admin/products/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            添加产品
          </Link>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="搜索产品名称/SKU..."
            value={filters.keyword}
            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
            className="px-4 py-2 border rounded-lg flex-1 min-w-48"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-4 py-2 border rounded-lg"
          >
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border rounded-lg"
          >
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={loadProducts} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            搜索
          </button>
        </div>
      </div>

      {/* 批量操作 */}
      {selected.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4 flex items-center gap-4">
          <span className="text-sm text-blue-700">已选择 {selected.length} 个产品</span>
          <button onClick={() => handleBulkStatus('published')} className="px-3 py-1 text-sm bg-green-600 text-white rounded">
            批量发布
          </button>
          <button onClick={() => handleBulkStatus('draft')} className="px-3 py-1 text-sm bg-gray-600 text-white rounded">
            批量设为草稿
          </button>
          <button onClick={handleBulkDelete} className="px-3 py-1 text-sm bg-red-600 text-white rounded">
            批量删除
          </button>
        </div>
      )}

      {/* 产品列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" onChange={handleSelectAll} checked={selected.length === products.length && products.length > 0} />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">产品名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">分类</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">模板</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">价格</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">库存</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">加载中...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500">暂无数据</td></tr>
            ) : products.map(product => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(product.id)} onChange={() => handleSelect(product.id)} />
                </td>
                <td className="px-4 py-3 text-sm">{product.sku}</td>
                <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{product.category}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">模板{product.templateType}</span>
                </td>
                <td className="px-4 py-3 text-sm">¥{product.价格}</td>
                <td className="px-4 py-3 text-sm">{product.库存 || 0}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.status === 'published' ? 'bg-green-100 text-green-600' :
                    product.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/admin/products/${product.id}`} className="text-blue-600 hover:underline mr-2">编辑</Link>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            共 {pagination.total} 条，第 {pagination.page}/{pagination.totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
