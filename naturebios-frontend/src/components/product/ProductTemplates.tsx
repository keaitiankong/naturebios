import React from 'react';
import { Product } from '../../types';

interface ProductTemplateAProps {
  product: Product;
}

/**
 * 模板A: 普通抗体产品
 * 适用于：一抗、二抗
 */
export const ProductTemplateA: React.FC<ProductTemplateAProps> = ({ product }) => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* 产品头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-sm">SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            {product.nameEn && <p className="text-blue-100 mt-1">{product.nameEn}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">¥{product.价格?.toFixed(2)}</p>
            <p className="text-blue-200 text-sm">
              {product.库存 && product.库存 > 0 ? `库存: ${product.库存}` : '缺货'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        {/* 快速信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <InfoCard label="宿主" value={product.host || '-'} />
          <InfoCard label="克隆性" value={product.clonality === 'monoclonal' ? '单克隆' : '多克隆'} />
          <InfoCard label="应用" value={product.applications?.join(', ') || '-'} />
          <InfoCard label="种属" value={product.species?.join(', ') || '-'} />
        </div>

        {/* 基因信息 */}
        {(product.geneSymbol || product.geneName || product.uniprotId) && (
          <Section title="基因信息">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.geneSymbol && <InfoCard label="基因符号" value={product.geneSymbol} />}
              {product.geneName && <InfoCard label="基因名称" value={product.geneName} />}
              {product.uniprotId && <InfoCard label="UniProt ID" value={product.uniprotId} />}
            </div>
          </Section>
        )}

        {/* 产品描述 */}
        {product.description && (
          <Section title="产品描述">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </Section>
        )}

        {/* 技术信息 */}
        <Section title="技术信息">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.molecularWeight && <InfoCard label="分子量" value={product.molecularWeight} />}
            {product.concentration && <InfoCard label="浓度" value={product.concentration} />}
            {product.purity && <InfoCard label="纯度" value={product.purity} />}
            {product.formulation && <InfoCard label="配方" value={product.formulation} />}
            {product.storage && <InfoCard label="保存条件" value={product.storage} />}
            {product.recommendedDilution && <InfoCard label="推荐稀释" value={product.recommendedDilution} />}
          </div>
        </Section>

        {/* 免疫原 */}
        {product.immunogen && (
          <Section title="免疫原">
            <p className="text-gray-600">{product.immunogen}</p>
          </Section>
        )}

        {/* 反应性 */}
        {product.reactivity && product.reactivity.length > 0 && (
          <Section title="反应种属">
            <div className="flex flex-wrap gap-2">
              {product.reactivity.map((species: string) => (
                <span key={species} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {species}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 文献引用 */}
        {product.citations && product.citations.length > 0 && (
          <Section title="文献引用">
            <ul className="space-y-2">
              {product.citations.map((citation: any, idx: number) => (
                <li key={idx} className="text-sm text-gray-600 border-l-2 border-blue-500 pl-3">
                  {citation.title} - {citation.journal}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* 说明书下载 */}
        {product.datasheet && (
          <div className="mt-8 pt-6 border-t">
            <a 
              href={product.datasheet} 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下载产品说明书
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 模板B: 试剂盒产品
 */
export const ProductTemplateB: React.FC<ProductTemplateAProps> = ({ product }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-200 text-sm">SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">¥{product.价格?.toFixed(2)}</p>
            <p className="text-green-200 text-sm">
              {product.库存 && product.库存 > 0 ? `库存: ${product.库存}` : '缺货'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        <Section title="试剂盒组成">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-gray-600">{product.description}</p>
          </div>
        </Section>

        <Section title="产品规格">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard label="规格" value={product.规格 || '-'} />
            <InfoCard label="检测种属" value={product.detectedSpecies?.join(', ') || '-'} />
            <InfoCard label="应用" value={product.applications?.join(', ') || '-'} />
            <InfoCard label="保存条件" value={product.storage || '-'} />
          </div>
        </Section>

        <Section title="操作步骤">
          <p className="text-gray-600">{product.descriptionEn || '详见说明书'}</p>
        </Section>
      </div>
    </div>
  );
};

/**
 * 模板C: 生化试剂
 */
export const ProductTemplateC: React.FC<ProductTemplateAProps> = ({ product }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-purple-200 text-sm">SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">¥{product.价格?.toFixed(2)}</p>
            <p className="text-purple-200 text-sm">
              {product.库存 && product.库存 > 0 ? `库存: ${product.库存}` : '缺货'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        <Section title="产品信息">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard label="分子式" value={product.molecularWeight || '-'} />
            <InfoCard label="分子量" value={product.molecularWeight || '-'} />
            <InfoCard label="纯度" value={product.purity || '-'} />
            <InfoCard label="浓度" value={product.concentration || '-'} />
            <InfoCard label="规格" value={product.规格 || '-'} />
            <InfoCard label="保存条件" value={product.storage || '-'} />
          </div>
        </Section>

        {product.description && (
          <Section title="产品描述">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </Section>
        )}
      </div>
    </div>
  );
};

/**
 * 模板D: 内参对照
 */
export const ProductTemplateD: React.FC<ProductTemplateAProps> = ({ product }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-orange-200 text-sm">SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <p className="text-orange-200 mt-1">内参对照抗体</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">¥{product.价格?.toFixed(2)}</p>
            <p className="text-orange-200 text-sm">
              {product.库存 && product.库存 > 0 ? `库存: ${product.库存}` : '缺货'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        <Section title="内参信息">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard label="基因符号" value={product.geneSymbol || '-'} />
            <InfoCard label="基因名称" value={product.geneName || '-'} />
            <InfoCard label="UniProt ID" value={product.uniprotId || '-'} />
            <InfoCard label="分子量" value={product.molecularWeight || '-'} />
            <InfoCard label="检测种属" value={product.detectedSpecies?.join(', ') || '-'} />
            <InfoCard label="应用" value={product.applications?.join(', ') || '-'} />
          </div>
        </Section>

        <Section title="推荐内参方案">
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-gray-600">
              {product.description || '详见产品说明书'}
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
};

/**
 * 模板E: 磷酸化/修饰抗体
 */
export const ProductTemplateE: React.FC<ProductTemplateAProps> = ({ product }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-red-200 text-sm">SKU: {product.sku}</p>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-red-800 rounded-full text-sm">
              磷酸化抗体
            </span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">¥{product.价格?.toFixed(2)}</p>
            <p className="text-red-200 text-sm">
              {product.库存 && product.库存 > 0 ? `库存: ${product.库存}` : '缺货'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-b-xl shadow-lg">
        <Section title="修饰信息">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard label="修饰类型" value={product.modification?.join(', ') || '-'} />
            <InfoCard label="磷酸化位点" value={product.phosphorylationSite || '-'} />
            <InfoCard label="基因符号" value={product.geneSymbol || '-'} />
            <InfoCard label="UniProt ID" value={product.uniprotId || '-'} />
            <InfoCard label="宿主" value={product.host || '-'} />
            <InfoCard label="克隆性" value={product.clonality === 'monoclonal' ? '单克隆' : '多克隆'} />
          </div>
        </Section>

        <Section title="检测信息">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <InfoCard label="推荐稀释比例" value={product.recommendedDilution || '-'} />
            <InfoCard label="孵育时间" value={product.incubationTime || '-'} />
          </div>
        </Section>

        {product.description && (
          <Section title="产品描述">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </Section>
        )}

        <Section title="注意事项">
          <div className="bg-red-50 p-4 rounded-lg">
            <ul className="list-disc list-inside text-gray-600 space-y1">
              <li>磷酸化蛋白易降解，建议新鲜配制</li>
              <li>添加蛋白酶和磷酸酶抑制剂</li>
              <li>避免反复冻融</li>
            </ul>
          </div>
        </Section>
      </div>
    </div>
  );
};

// 辅助组件
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
    {children}
  </div>
);

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
  </div>
);

export default {
  ProductTemplateA,
  ProductTemplateB,
  ProductTemplateC,
  ProductTemplateD,
  ProductTemplateE,
};
