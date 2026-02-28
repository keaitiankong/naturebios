import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductListPage } from './pages/ProductListPage';

// 公开页面组件（简化版）
const HomePage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">Nature Biosciences</h1>
        <nav className="flex gap-6">
          <a href="#products" className="text-gray-600 hover:text-blue-600">产品</a>
          <a href="#literatures" className="text-gray-600 hover:text-blue-600">文献</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600">关于我们</a>
          <a href="/login" className="text-blue-600 hover:underline">管理登录</a>
        </nav>
      </div>
    </header>
    
    <main className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          共同科研探索生命科学未知领域
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          砥砺前行，不负韶华
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">🔬 一抗/二抗</h3>
            <p className="text-gray-600">覆盖9大物种，多种应用</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">📦 试剂盒</h3>
            <p className="text-gray-600">ELISA、WB、IHC全套解决方案</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">🧪 生化试剂</h3>
            <p className="text-gray-600">高品质科研试剂</p>
          </div>
        </div>
      </div>
    </main>
  </div>
);

// 产品编辑页面
const ProductEditPage = () => {
  // 这里应该从URL获取ID来判断是新建还是编辑
  const isEdit = window.location.pathname.includes('/admin/products/') && 
                 !window.location.pathname.endsWith('/new');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? '编辑产品' : '添加产品'}
      </h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">产品编辑表单（开发中...）</p>
        {/* 表单组件会在完整版中添加 */}
      </div>
    </div>
  );
};

// 简单的认证检查
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 登录处理
const App: React.FC = () => {
  const handleLogin = (token: string, user: any) => {
    console.log('Logged in:', user);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        
        {/* 管理后台路由 */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/products" element={<PrivateRoute><ProductListPage /></PrivateRoute>} />
        <Route path="/admin/products/new" element={<PrivateRoute><ProductEditPage /></PrivateRoute>} />
        <Route path="/admin/products/:id" element={<PrivateRoute><ProductEditPage /></PrivateRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
