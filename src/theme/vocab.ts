// 主题词汇表：section id → 展示名的主题兜底。
// P5 主题系统会按主题覆写（如宝可梦主题的 tomes → 「图鉴」）；当前为星露谷基准值。
export const SECTION_LABEL_FALLBACKS: Record<string, string> = {
  plugins: '插件',
  skills: '技能',
  mcp: 'MCP',
  tools: '工具',
  tomes: '秘籍'
};

export function sectionLabel(sec: { id: string; label?: string }): string {
  return sec.label ?? SECTION_LABEL_FALLBACKS[sec.id] ?? sec.id;
}
