# {{TITLE}}

{{NAME}} 的装备背包 —— 星露谷风格的 harness inventory 展示站（插件 / 技能 / MCP / 踩坑典籍）。

## 快速开始

```bash
pnpm install
pnpm dev        # 本地开发预览
pnpm validate   # 配置校验（改 config/ 后必跑）
pnpm build      # 生产构建 → dist/
```

## 填充你的背包

1. **身份与统计**：`config/harness.yaml`（统计一键采集：`node skills/harness-inventory/scripts/collect-stats.mjs`）
2. **装备条目**：`config/harness.yaml` → `sections[].items[]`，全字段文档见 `skills/harness-inventory/references/schema.md`
3. **深度正文**：`config/content/<section>/<id>.md`（Markdown）
4. **图标**：内置套件 id（站内 `#/icons` 图鉴页浏览）或 `config/icons/` 自定义 16×16 SVG

全流程指引（隐私自检 → GitHub Pages 发布 → badge 领取）：`skills/harness-inventory/SKILL.md`

## 发布

`pnpm privacy:scan` 通过后 push 到 GitHub → Settings → Pages → GitHub Actions。
名片 badge：`<站点URL>/badges/<theme>.svg`（站内 `#/badge` 页提供 URL / Markdown / HTML 嵌入片段）。
