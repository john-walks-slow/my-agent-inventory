// 浏览器侧套件资产映射（仅前端可导入；registry.ts 保持 Node/浏览器双安全）
// 文件名去扩展名即套件 id（P3 由入库脚本生成资产）。
const modules = import.meta.glob('/src/iconkit/assets/*.{png,gif,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const KIT_ASSET_URLS: Record<string, string> = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() ?? '';
  KIT_ASSET_URLS[file.replace(/\.(png|gif|webp)$/, '')] = url;
}
