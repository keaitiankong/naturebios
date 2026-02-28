import axios from 'axios';
import { Product, Category, SearchParams, SearchResult, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// 请求拦截器 - 添加Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ==================== 公开API ====================

// 搜索产品
export const searchProducts = (params: SearchParams): Promise<SearchResult> => {
  return api.get('/products/search', { params });
};

// 获取搜索建议
export const getSuggestions = (keyword: string): Promise<any[]> => {
  return api.get('/products/suggestions', { params: { keyword } });
};

// 获取热门产品
export const getPopularProducts = (): Promise<Product[]> => {
  return api.get('/products/popular');
};

// 获取产品详情
export const getProduct = (id: string): Promise<{ product: Product; related: Product[] }> => {
  return api.get(`/products/${id}`);
};

// 获取产品列表
export const getProducts = (params: { category?: string; page?: number; pageSize?: number }): Promise<SearchResult> => {
  return api.get('/products', { params });
};

// 获取分类列表
export const getCategories = (): Promise<Category[]> => {
  return api.get('/categories');
};

// 获取文献列表
export const getLiteratures = (params?: { page?: number; pageSize?: number }): Promise<any> => {
  return api.get('/literatures', { params });
};

// ==================== 认证API ====================

export const login = (username: string, password: string): Promise<{ token: string; user: User }> => {
  return api.post('/auth/login', { username, password });
};

export const getCurrentUser = (): Promise<User> => {
  return api.get('/auth/me');
};

// ==================== 管理API ====================

// 产品管理
export const createProduct = (data: Partial<Product>): Promise<Product> => {
  return api.post('/admin/products', data);
};

export const updateProduct = (id: string, data: Partial<Product>): Promise<Product> => {
  return api.put(`/admin/products/${id}`, data);
};

export const deleteProduct = (id: string): Promise<void> => {
  return api.delete(`/admin/products/${id}`);
};

// 批量导入
export const importProducts = (file: File, updateExisting = false): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  if (updateExisting) formData.append('updateExisting', 'true');
  return api.post('/admin/products/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// 批量更新
export const bulkUpdateProducts = (ids: string[], updates: Partial<Product>): Promise<any> => {
  return api.post('/admin/products/bulk-update', { ids, updates });
};

// 批量删除
export const bulkDeleteProducts = (ids: string[]): Promise<any> => {
  return api.post('/admin/products/bulk-delete', { ids });
};

// 下载导入模板
export const downloadTemplate = (): Promise<Blob> => {
  return api.get('/admin/products/template', { responseType: 'blob' });
};

// 用户管理
export const getUsers = (): Promise<User[]> => {
  return api.get('/admin/users');
};

export const createUser = (data: Partial<User> & { password: string }): Promise<User> => {
  return api.post('/admin/users', data);
};

export const updateUser = (id: string, data: Partial<User>): Promise<void> => {
  return api.put(`/admin/users/${id}`, data);
};

export const deleteUser = (id: string): Promise<void> => {
  return api.delete(`/admin/users/${id}`);
};

// 统计数据
export const getStats = (): Promise<any> => {
  return api.get('/admin/stats');
};

// 操作日志
export const getLogs = (params?: { page?: number; pageSize?: number }): Promise<any> => {
  return api.get('/admin/logs', { params });
};

export default api;
