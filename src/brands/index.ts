// 官方内置娘化头像（src/brands/*.svg，仅保留 deepseek / claude / codex / gemini 4 种）
// 其余通过 config/icons/<avatar>.(svg|png) 自定义；缺省或未命中则自动生成 16×16 点阵像素字头像兜底。
/// <reference types="vite/client" />
import type { CustomIcon } from '../iconkit/resolve';
import { generatePixelTextSvg } from './pixelText';

export { generatePixelTextSvg } from './pixelText';

// Vite 构建时静态内联；Node 运行时安全兜底
const modules = (
  typeof import.meta !== 'undefined' && 'glob' in import.meta
    ? (import.meta as any).glob('/src/brands/*.svg', {
        query: '?raw',
        import: 'default',
        eager: true,
      })
    : {}
) as Record<string, string>;

/** 内置娘化头像 key → SVG 源码（deepseek, claude, codex, gemini） */
export const BUILTIN_AVATARS: Record<string, string> = {};
for (const [p, raw] of Object.entries(modules)) {
  BUILTIN_AVATARS[p.split('/').pop()!.replace(/\.svg$/, '')] = raw;
}

export const BUILTIN_AVATAR_KEYS = ['deepseek', 'claude', 'codex', 'gemini'];

export function isBuiltinAvatar(key: string): boolean {
  return key in BUILTIN_AVATARS;
}

export type AvatarResolution =
  | { kind: 'custom-svg'; raw: string; key: string }
  | { kind: 'custom-img'; url: string; key: string }
  | { kind: 'builtin'; raw: string; key: string }
  | { kind: 'pixel-text'; raw: string; key: string };

/**
 * 头像三级解析链：
 * 1. config/icons/<avatar>.(svg|png) 用户自定义优先
 * 2. 内置 4 大娘化预设头像（deepseek / claude / codex / gemini）
 * 3. 兜底：根据 harness 名字动态生成 16×16 纯点阵像素字头像
 */
export function resolveAvatar(
  avatar: string | undefined,
  harnessName: string,
  customIcons: Record<string, CustomIcon>
): AvatarResolution {
  if (avatar && customIcons[avatar]) {
    const icon = customIcons[avatar];
    if (icon.kind === 'svg') return { kind: 'custom-svg', raw: icon.raw, key: avatar };
    return { kind: 'custom-img', url: icon.url, key: avatar };
  }
  if (avatar && BUILTIN_AVATARS[avatar]) {
    return { kind: 'builtin', raw: BUILTIN_AVATARS[avatar], key: avatar };
  }
  // 兜底：自动生成复古 16×16 点阵像素字
  const pixelTextSvg = generatePixelTextSvg(harnessName || 'AI');
  return { kind: 'pixel-text', raw: pixelTextSvg, key: 'pixel-text' };
}
