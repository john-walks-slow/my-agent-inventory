// 浏览器侧配置装载：YAML + content Markdown + 自定义图标 → 站点数据模型
// Node 侧校验请用 scripts/validate.ts（同一 schema）。
import { parse } from 'yaml';
import harnessYamlRaw from '../../config/harness.yaml?raw';
import { siteConfigSchema, type SiteConfig, type ItemConfig, type SectionConfig } from './schema';
import { isKitIcon } from '../iconkit/registry';

// ---- 静态资产 glob（构建期由 Vite 内联/拷贝） ----

const contentModules = import.meta.glob('/config/content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const svgIconModules = import.meta.glob('/config/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const imgIconModules = import.meta.glob('/config/icons/*.{png,gif,webp,jpg,jpeg}', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// ---- 装载结果类型 ----

export type CustomIcon =
  | { kind: 'svg'; raw: string }
  | { kind: 'img'; url: string };

export type IconRef =
  | { kind: 'custom-svg'; raw: string; name: string }
  | { kind: 'custom-img'; url: string; name: string }
  | { kind: 'kit'; id: string }
  | { kind: 'fallback' };

export interface ItemView extends ItemConfig {
  /** 完整正文 Markdown（约定路径 config/content/<section>/<id>.md，缺省为空串） */
  content: string;
  iconRef: IconRef;
}

export interface SectionView extends SectionConfig {
  items: ItemView[];
  iconRef: IconRef;
}

export interface InventoryModel {
  config: SiteConfig;
  sections: SectionView[];
  /** key: '<sectionId>/<itemId>' */
  contents: Record<string, string>;
  customIcons: Record<string, CustomIcon>;
}

// ---- 装载 ----

const fileName = (p: string) => p.split('/').pop() ?? '';

export function loadSiteConfig(): SiteConfig {
  let data: unknown;
  try {
    data = parse(harnessYamlRaw);
  } catch (e) {
    throw new Error(`config/harness.yaml YAML 语法错误: ${(e as Error).message}`);
  }
  const result = siteConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`config/harness.yaml 校验失败:\n${result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  }
  return result.data;
}

function loadContents(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, raw] of Object.entries(contentModules)) {
    // /config/content/plugins/foo.md → plugins/foo
    const key = path.replace(/^\/config\/content\//, '').replace(/\.md$/, '');
    map[key] = raw;
  }
  return map;
}

function loadCustomIcons(): Record<string, CustomIcon> {
  const map: Record<string, CustomIcon> = {};
  for (const [path, raw] of Object.entries(svgIconModules)) {
    map[fileName(path).replace(/\.svg$/, '')] = { kind: 'svg', raw };
  }
  for (const [path, url] of Object.entries(imgIconModules)) {
    map[fileName(path).replace(/\.(png|gif|webp|jpg|jpeg)$/, '')] = { kind: 'img', url };
  }
  return map;
}

function resolveIcon(name: string | undefined, customIcons: Record<string, CustomIcon>): IconRef {
  if (!name) return { kind: 'fallback' };
  const custom = customIcons[name];
  if (custom?.kind === 'svg') return { kind: 'custom-svg', raw: custom.raw, name };
  if (custom?.kind === 'img') return { kind: 'custom-img', url: custom.url, name };
  if (isKitIcon(name)) return { kind: 'kit', id: name };
  return { kind: 'fallback' };
}

export function buildInventoryModel(): InventoryModel {
  const config = loadSiteConfig();
  const contents = loadContents();
  const customIcons = loadCustomIcons();

  const sections: SectionView[] = config.sections.map((sec) => ({
    ...sec,
    iconRef: resolveIcon(sec.icon, customIcons),
    items: sec.items.map((item) => ({
      ...item,
      content: contents[`${sec.id}/${item.id}`] ?? '',
      iconRef: resolveIcon(item.icon, customIcons),
    })),
  }));

  return { config, sections, contents, customIcons };
}
