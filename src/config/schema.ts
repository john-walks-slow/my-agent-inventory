// harness-inventory 配置 schema —— 唯一事实源
// 消费方：① vite.config 校验插件（buildStart/watchChange）② 浏览器 loader ③ scripts/validate.ts
// 本模块必须保持 Node 与浏览器双端可导入（仅依赖 zod，禁止任何环境 API）。
import { z } from 'zod';

export const THEMES = ['stardew', 'pokemon', 'jrpg', 'diablo'] as const;
export const RARITIES = ['normal', 'silver', 'gold', 'iridium'] as const;
export const SECTION_VIEWS = ['grid', 'reader'] as const;

export type ThemeId = (typeof THEMES)[number];
export type Rarity = (typeof RARITIES)[number];
export type SectionView = (typeof SECTION_VIEWS)[number];

/** id 规则：小写字母/数字开头，允许 - _ . */
const ID_RE = /^[a-z0-9][a-z0-9-_.]*$/;

const idField = z.string().regex(ID_RE, 'id 只允许小写字母、数字与 - _ .，且以字母或数字开头');

export const harnessStatsSchema = z.strictObject({
  /** 主会话数（root 口径，不含子代理） */
  sessions: z.number().int().min(0).optional(),
  /** 子代理会话数（仅档案彩蛋展示用） */
  subagentSessions: z.number().int().min(0).optional(),
  /** 累计 Token（非缓存 input+output 口径） */
  tokens: z.number().int().min(0).optional(),
  /** 缓存命中 Token（可选展示） */
  cacheTokens: z.number().int().min(0).optional(),
});

export const harnessSchema = z.strictObject({
  name: z.string().min(1),
  nickname: z.string().optional(),
  /** 内置品牌头像 key，见 src/brands；缺省 generic */
  brand: z.string().optional(),
  /** 自定义头像（config/icons/ 下的文件名，不含扩展名） */
  customAvatar: z.string().optional(),
  version: z.string().optional(),
  /** 安装日期 YYYY-MM-DD（建议加引号） */
  since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'since 需为 YYYY-MM-DD（记得加引号）').optional(),
  stats: harnessStatsSchema.optional(),
  /** 显式等级覆盖（1-99）；缺省由锚点公式自动计算 */
  level: z.number().int().min(1).max(99).optional(),
});

export const itemSchema = z.strictObject({
  id: idField,
  name: z.string().min(1),
  /** 副标题 / 中文称号 */
  title: z.string().optional(),
  /** 图标：config/icons/<icon>.svg|png → kit id → 兜底 */
  icon: z.string().optional(),
  rarity: z.enum(RARITIES).default('normal'),
  /** section 内筛选分类，必须出现在所属 section 的 categories 中 */
  category: z.string().optional(),
  stack: z.number().int().min(1).optional(),
  version: z.string().optional(),
  author: z.string().optional(),
  repo: z.string().optional(),
  /** 安装块：仅 plugins / mcp / 有仓库的 skill 应填写 */
  install: z.string().optional(),
  /** 配置示例：插件给 cordis.yml，MCP 给 mcpServers JSON */
  config: z.string().optional(),
  description: z.string(),
  highlights: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  /** 人类真实备注（默认不出现；主题化命名） */
  note: z.string().optional(),
  added: z.string().optional(),
});

export const categoryDefSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const sectionSchema = z.strictObject({
  id: idField,
  label: z.string().optional(),
  icon: z.string().optional(),
  /** grid（默认，背包格）| reader（典籍阅读器） */
  view: z.enum(SECTION_VIEWS).default('grid'),
  categories: z.array(categoryDefSchema).optional(),
  items: z.array(itemSchema),
});

export const siteConfigSchema = z.strictObject({
  site: z.strictObject({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    theme: z.enum(THEMES).default('stardew'),
  }),
  harness: harnessSchema,
  sections: z.array(sectionSchema).min(1),
}).superRefine((cfg, ctx) => {
  // section id 唯一
  const seenSections = new Set<string>();
  for (const sec of cfg.sections) {
    if (seenSections.has(sec.id)) {
      ctx.addIssue({ code: 'custom', path: ['sections'], message: `section id 重复: ${sec.id}` });
    }
    seenSections.add(sec.id);
  }
  // 分类 id 唯一 + item id 唯一 + item.category 必须有对应分类
  cfg.sections.forEach((sec, sIdx) => {
    const catIds = new Set<string>();
    (sec.categories ?? []).forEach((cat) => {
      if (catIds.has(cat.id)) {
        ctx.addIssue({ code: 'custom', path: ['sections', sIdx, 'categories'], message: `分类 id 重复: ${cat.id}` });
      }
      catIds.add(cat.id);
    });
    const itemIds = new Set<string>();
    sec.items.forEach((item, iIdx) => {
      if (itemIds.has(item.id)) {
        ctx.addIssue({ code: 'custom', path: ['sections', sIdx, 'items', iIdx, 'id'], message: `item id 重复: ${item.id}` });
      }
      itemIds.add(item.id);
      if (item.category && !catIds.has(item.category)) {
        ctx.addIssue({
          code: 'custom',
          path: ['sections', sIdx, 'items', iIdx, 'category'],
          message: `category "${item.category}" 未在 section "${sec.id}" 的 categories 中定义`,
        });
      }
    });
  });
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type HarnessInfo = z.infer<typeof harnessSchema>;
export type SectionConfig = z.infer<typeof sectionSchema>;
export type ItemConfig = z.infer<typeof itemSchema>;

/** 把 zod issues 格式化为带路径的人类可读信息（终端/overlay 共用） */
export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `  - config.${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
}
