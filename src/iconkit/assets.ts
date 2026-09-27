// 浏览器侧套件资产映射（仅前端可导入；registry.ts 保持 Node/浏览器双安全）
// manifest 的 value 是原始包内文件名（仅溯源）；入库时资产已统一重命名为 <id>.png。
import { KIT_MANIFEST } from './manifest.gen';

const modules = import.meta.glob('/src/iconkit/assets/*.png', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const KIT_ASSET_URLS: Record<string, string> = {};
for (const id of Object.keys(KIT_MANIFEST)) {
  const url = modules[`/src/iconkit/assets/${id}.png`];
  if (url) KIT_ASSET_URLS[id] = url;
}
