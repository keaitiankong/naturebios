// 产品类型定义
export interface Product {
  id: string;
  sku: string;
  name: string;
  nameEn?: string;
  category: 'primary_antibody' | 'secondary_antibody' | 'biochemical' | 'kit' | 'control' | 'phospho';
  templateType: 'A' | 'B' | 'C' | 'D' | 'E';
  description?: string;
  descriptionEn?: string;
  applications?: string[];
  species?: string[];
  host?: string;
  clonality?: 'monoclonal' | 'polyclonal';
  geneName?: string;
  geneSymbol?: string;
  uniprotId?: string;
  molecularWeight?: string;
  immunogen?: string;
  concentration?: string;
  purity?: string;
  formulation?: string;
  storage?: string;
  reactivity?: string[];
  modification?: string[];
  phosphorylationSite?: string;
  detectedSpecies?: string[];
  recommendedDilution?: string;
  incubationTime?: string;
  规格?: string;
  价格?: number;
  库存?: number;
  citations?: any[];
  images?: string[];
  datasheet?: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  parentId?: string;
  children?: Category[];
}

export interface User {
  id: string;
  username: string;
  name?: string;
  email?: string;
  role: 'admin' | 'sub_admin';
}

export interface SearchParams {
  keyword?: string;
  category?: string;
  species?: string;
  application?: string;
  host?: string;
  clonality?: string;
  modification?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface SearchResult {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
