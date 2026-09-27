// 图标解析链（纯函数，Node 与浏览器双端可导入，可单测）：
//   1. config/icons/<icon>.svg    → 内联 SVG（手绘图腾）
//   2. config/icons/<icon>.png 等 → 位图（AIGC 可选通道）
//   3. 套件 id（src/iconkit）     → 内置 7Soul 图标（多物品共用合法）
//   4. 兜底问号木牌

export type CustomIcon =
  | { kind: 'svg'; raw: string }
  | { kind: 'img'; url: string };

export type IconRef =
  | { kind: 'custom-svg'; raw: string; name: string }
  | { kind: 'custom-img'; url: string; name: string }
  | { kind: 'kit'; id: string }
  | { kind: 'fallback' };

export function resolveIconRef(
  name: string | undefined,
  customIcons: Record<string, CustomIcon>,
  kitIds: ReadonlySet<string> | Readonly<Record<string, unknown>>
): IconRef {
  if (!name) return { kind: 'fallback' };
  const custom = customIcons[name];
  if (custom?.kind === 'svg') return { kind: 'custom-svg', raw: custom.raw, name };
  if (custom?.kind === 'img') return { kind: 'custom-img', url: custom.url, name };
  const inKit =
    kitIds instanceof Set
      ? kitIds.has(name)
      : Object.prototype.hasOwnProperty.call(kitIds, name);
  if (inKit) return { kind: 'kit', id: name };
  return { kind: 'fallback' };
}
