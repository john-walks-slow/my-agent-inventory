# 内容扩展与维护规范 (Content Maintenance Guide)

本文档规范未来向“我的 DSH 背包”新增插件、技能、MCP、典籍及手绘像素图标的完整操作流程与数据契约。

---

## 1. 核心数据源：`src/data/inventoryData.ts`

所有展示内容为纯静态 TypeScript 数据结构，零数据库依赖。

### 1.1 新增插件 (PLUGINS_DATA)
在 `PLUGINS_DATA` 数组末尾添加对象：
```typescript
{
  id: 'dsh-your-plugin',             // 唯一英文 ID，与插件名一致
  name: 'dsh-your-plugin',           // 包名
  chineseName: '中文称号',            // 典雅中文名称
  category: 'plugins',               // 固定为 'plugins'
  subCategory: 'core' | 'tools' | 'workflow' | 'experiment',
  rarity: 'normal' | 'silver' | 'gold' | 'iridium', // 品质星级（普通/银/金/铱星★）
  stackSize: 1,                      // 堆叠数量（如 1, 16, 99）
  iconType: 'your-icon-key',         // 对应 PixelArtIcon 里的 switch 分支
  description: '一句话简短摘要（展示在卡片顶部）',
  longDescription: `【痛点】\n...\n【核心特性】\n...`,
  version: '1.0.0',
  author: 'John Ren',
  repoUrl: 'https://github.com/johnren/...',
  installCommand: 'dsh plugin install ...',
  configExample: `plugins:\n  ...`,
  tags: ['Subagent', 'Core'],
  docId: 'optional-book-id',         // 可选：若关联某篇典籍，点击“翻阅典籍”可一键跳转
  highlights: ['特性1', '特性2', '特性3', '特性4'],
  tips: '农场主使用秘笈与实战忠告',
  createdDate: '2026-09-16'
}
```

### 1.2 新增技能 (SKILLS_DATA)
在 `SKILLS_DATA` 数组添加对象：
- `category`: 固定为 `'skills'`
- `subCategory`: `'ops' | 'workflow' | 'ai-core' | 'office' | 'multimodal'`
- 建议 `installCommand` 填写：`cp -r ~/.agents/skills/<skill-name> <target>` 或安装指引。

### 1.3 新增 MCP 服务器 (MCP_DATA)
在 `MCP_DATA` 数组添加对象：
- `category`: 固定为 `'mcp'`
- `subCategory`: `'search' | 'research'`
- 建议在 `installCommand` 或 `configExample` 中附带该 MCP 在 DSH 中的 JSON 配置片段。

### 1.4 新增实战典籍长文 (BOOKS_DATA)
在 `BOOKS_DATA` 数组添加对象：
```typescript
{
  id: 'your-unique-book-id',         // 与上文 item.docId 对应
  title: '【实战排坑】文章主标题',
  subtitle: '极客风副标题',
  category: 'books',
  subCategory: 'pitfalls' | 'container' | 'agent-tricks' | 'architecture',
  author: 'John Ren',
  readTime: '8 分钟',
  date: '2026-09-16',
  iconType: 'flame',                 // 像素图标名
  rarity: 'iridium',
  summary: '一句话故事背景摘要',
  tags: ['Kernel', 'Linux'],
  content: `# 完整 Markdown 正文内容\n\n## 一、故障现象\n...`
}
```
正文支持完整的 GFM Markdown、二级标题、代码块高亮（`pre code`）、引用块和列表。

---

## 2. 绘制与扩展新像素图标：`src/components/PixelArtIcon.tsx`

若新增的物品需要专属道具图腾，不要使用通用矢量图标，在 `PixelArtIcon.tsx` 中的 `renderPixels()` 添加一个 16×16 的 SVG 分支：

```typescript
case 'your-icon-key':
  return (
    <g>
      {/* 坐标范围 x: 0~15, y: 0~15 */}
      {/* 深色轮廓 (#4a2113 或 #5b2b2a) */}
      <rect x="3" y="3" width="10" height="10" fill="#4a2113" />
      {/* 主色体 */}
      <rect x="4" y="4" width="8" height="8" fill="#e76f51" />
      {/* 高光点 (#fff 或 #ffe4a1) */}
      <rect x="5" y="5" width="2" height="2" fill="#fff" />
    </g>
  );
```

---

## 3. 构建与验证流程

每次修改数据后，必须执行构建以确保无 TypeScript 类型错误与模块打包异常：
```bash
# 1. 静态类型检查与编译构建
pnpm build

# 2. 检查本地服务
curl -s -I http://127.0.0.1:5180

# 3. 提交 Git
git add src/data/inventoryData.ts
git commit -m "feat(content): add new item <name>"
```
