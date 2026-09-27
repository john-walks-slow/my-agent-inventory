// 品牌像素头像（src/brands/*.svg，16×16，tools/gen-brands.mjs 生成）。
// 仅前端可导入；档案弹窗与 HUD 通过 brand key 或 customAvatar 解析。
import type { CustomIcon } from '../iconkit/resolve';

const modules = import.meta.glob('/src/brands/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** 内置品牌 key → SVG 源码（如 'dsh'、'claude-code'） */
export const BRAND_AVATARS: Record<string, string> = {};
for (const [path, raw] of Object.entries(modules)) {
  BRAND_AVATARS[path.split('/').pop()!.replace(/\.svg$/, '')] = raw;
}

export const BRAND_KEYS = Object.keys(BRAND_AVATARS);

export function isKnownBrand(key: string): boolean {
  return key in BRAND_AVATARS;
}

/** 头像解析：customAvatar（config/icons/）优先 → 内置品牌 → generic 兜底 */
export function resolveAvatar(
  brand: string | undefined,
  customAvatar: string | undefined,
  customIcons: Record<string, CustomIcon>
): { kind: 'custom-svg' | 'custom-img' | 'brand' | 'generic'; raw?: string; url?: string; key: string } {
  if (customAvatar && customIcons[customAvatar]) {
    const icon = customIcons[customAvatar];
    if (icon.kind === 'svg') return { kind: 'custom-svg', raw: icon.raw, key: customAvatar };
    return { kind: 'custom-img', url: icon.url, key: customAvatar };
  }
  if (brand && BRAND_AVATARS[brand]) return { kind: 'brand', raw: BRAND_AVATARS[brand], key: brand };
  return { kind: 'generic', raw: BRAND_AVATARS['generic'], key: 'generic' };
}
