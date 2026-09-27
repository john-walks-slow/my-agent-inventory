// 浏览器侧配置装载：YAML + content Markdown + 自定义图标 → 站点数据模型
// Node 侧校验请用 scripts/validate.ts（同一 schema）。
import { parse } from 'yaml';
import harnessYamlRaw from '../../config/harness.yaml?raw';
import { siteConfigSchema, type SiteConfig, type ItemConfig, type SectionConfig, type HarnessInfo } from './schema';
import { KIT_ICONS } from '../iconkit/registry';
import { resolveIconRef, type CustomIcon, type IconRef } from '../iconkit/resolve';
import { resolveAvatar } from '../brands';
import { computeLevel, daysSince, type LevelResult } from '../stats/level';

export type { CustomIcon, IconRef } from '../iconkit/resolve';

export type AvatarRef = ReturnType<typeof resolveAvatar>;

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

export interface ItemView extends ItemConfig {
  /** 完整正文 Markdown（约定路径 config/content/<section>/<id>.md，缺省为空串） */
  content: string;
  iconRef: IconRef;
}

export interface SectionView extends SectionConfig {
  items: ItemView[];
  iconRef: IconRef;
}

export interface HarnessProfileView {
  info: HarnessInfo;
  avatar: AvatarRef;
  stats: {
    sessions?: number;
    subagentSessions?: number;
    tokens?: number;
    cacheTokens?: number;
    days: number;
  };
  /** sectionId → 物品数（装备计数） */
  gear: Record<string, number>;
  gearTotal: number;
  level: LevelResult;
}

export interface InventoryModel {
  config: SiteConfig;
  sections: SectionView[];
  /** key: '<sectionId>/<itemId>' */
  contents: Record<string, string>;
  customIcons: Record<string, CustomIcon>;
  profile: HarnessProfileView;
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
  return resolveIconRef(name, customIcons, KIT_ICONS);
}

function buildProfile(config: SiteConfig, sections: SectionView[], customIcons: Record<string, CustomIcon>): HarnessProfileView {
  const h = config.harness;
  const gear: Record<string, number> = {};
  let gearTotal = 0;
  for (const sec of sections) {
    gear[sec.id] = sec.items.length;
    gearTotal += sec.items.length;
  }
  const days = daysSince(h.since);
  const level = computeLevel(
    {
      sessions: h.stats?.sessions,
      tokens: h.stats?.tokens,
      days,
      gear,
    },
    h.level
  );
  return {
    info: h,
    avatar: resolveAvatar(h.brand, h.customAvatar, customIcons),
    stats: {
      sessions: h.stats?.sessions,
      subagentSessions: h.stats?.subagentSessions,
      tokens: h.stats?.tokens,
      cacheTokens: h.stats?.cacheTokens,
      days,
    },
    gear,
    gearTotal,
    level,
  };
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

  return { config, sections, contents, customIcons, profile: buildProfile(config, sections, customIcons) };
}
