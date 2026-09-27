// 内置图标套件注册表 —— 纯数据模块（Node 与浏览器双端可导入，禁止环境 API）
// id 命名约定：小写短横线语义名（如 sword / potion-red / spell-book）。
// P3 阶段由 7Soul 资产入库脚本生成完整映射；本文件保持手工可维护的「常用 id 分组」。
// 同一 id 被多个物品共用是合法且鼓励的。

export interface KitGroup {
  /** 分组名（图鉴页/文档用） */
  label: string;
  ids: string[];
}

/** id → 套件资产文件名（相对 src/iconkit/assets/） */
export const KIT_ICONS: Record<string, string> = {
  // 占位：P3 生成
};

/** 常用 id 分组速查（fork 者友好；文档与图鉴页共用） */
export const KIT_GROUPS: KitGroup[] = [
  { label: '武器', ids: [] },
  { label: '防具', ids: [] },
  { label: '药水', ids: [] },
  { label: '魔法', ids: [] },
  { label: '书籍', ids: [] },
  { label: '工具', ids: [] },
];

export function isKitIcon(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(KIT_ICONS, id);
}
