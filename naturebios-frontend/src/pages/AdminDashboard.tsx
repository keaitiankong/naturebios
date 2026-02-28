import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats, getProducts } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, productsData] = await Promise.all([
        getStats(),
        getProducts({ pageSize: 5 })
      ]);
      setStats(statsData);
      setRecentProducts(productsData.list || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { title: '仪表盘', icon: '📊', path: '/admin', exact: true },
    { title: '产品管理', icon: '🔬', path: '/admin/products' },
    { title: '分类管理', icon: '📁', path: '/admin/categories' },
    { title: '文献管理', icon: '📚', path: '/admin/literatures' },
    { title: '用户管理', icon: '👥', path: '/admin/users' },
    { title: '系统设置', icon: '⚙️', path: '/admin/settings' },
  ];

  const isActive = (path: string, exact = false) => {
    const currentPath = window.location.pathname;
    return exact ? currentPath === path : currentPath.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Nature Biosciences</h1>
          <p className="text-sm text-gray-500">后台管理</p>
        </div>

        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition ${
                isActive(item.path, item.exact)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">{user.name?.[0] || user.username[0]}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name || user.username}</p>
              <p className="text-xs text-gray-500">{user.role === 'admin' ? '管理员' : '操作员'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">仪表盘</h2>
          <p className="text-gray-500">欢迎回来，{user.name || user.username}</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="产品总数" value={stats.productCount || 0} icon="🔬" color="blue" />
          <StatCard title="分类数" value={stats.categoryCount || 0} icon="📁" color="green" />
          <StatCard title="活跃用户" value={stats.userCount || 0} icon="👥" color="purple" />
          <StatCard title="本周新增" value={stats.recentProducts || 0} icon="📈" color="orange" />
        </div>

        {/* 最近产品 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">最近产品</h3>
            <Link to="/admin/products" className="text-blue-600 hover:underline">
              查看全部
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3">SKU</th>
                <th className="pb-3">产品名称</th>
                <th className="pb-3">分类</th>
                <th className="pb-3">价格</th>
                <th className="pb-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="py-3 text-sm">{product.sku}</td>
                  <td className="py-3 text-sm font-medium">{product.name}</td>
                  <td className="py-3 text-sm text-gray-500">{product.category}</td>
                  <td className="py-3 text-sm">¥{product.价格}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'published' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
  title, value, icon, color
}) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
