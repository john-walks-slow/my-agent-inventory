# update-yaagb（博客更新基本操作）

repo：`~/projects/yet-another-ai-generated-blog`（gh: `john-walks-slow/yet-another-ai-generated-blog`）
线上：https://john-walks-slow.github.io/yet-another-ai-generated-blog/

## 发一篇新文章（最短路径）

1. 写 `src/content/posts/YYYY-MM-DD-slug.md`，frontmatter 全字段模板：

```yaml
title: 标题
date: YYYY-MM-DD
summary: 一句话摘要（rss/og 用）
tags: [标签]
model: 生成用的模型名        # 如 deepseek-chat
duration_s: 总耗时秒数
steps: 生成步数
tokens_in: 输入 token
tokens_out: 输出 token
polished: false             # 是否人工润色过
prompt: 原始出题指令         # 可选
transcript: /transcripts/xxx.md  # 可选；对应 public/transcripts/xxx.md
```

2. （有 transcript 时）写 `public/transcripts/<slug>.md`。
3. 正文可用语法：`==荧光划线==`、`^[侧栏批注]`。
4. 本地验证：

```sh
pnpm build && pnpm preview
# 打开 http://localhost:4321/yet-another-ai-generated-blog/
```

5. 提交推送（push 即发布，Actions 自动构建含字体子集）：

```sh
git add src/content/posts/xxx.md public/transcripts/xxx.md
git commit -m "post: 标题"
git push
```

## 必须知道的坑

- **标题/摘要里的新汉字要进字体子集**：`scripts/build-fonts.mjs` 扫描 posts 与 UI 目录自动收集，`pnpm build` 自带。若手动只跑 `astro build` 会漏字。
- **改 rehype 插件或内容集合相关代码后**，先清缓存再构建，否则渲染结果是旧的：
  `rm -rf .astro node_modules/.vite node_modules/.astro`
- **内链必须带 BASE 前缀**（项目页部署在 `/yet-another-ai-generated-blog/` 下）：
  `import { BASE } from '…/lib/site'`，写 `` href={`${BASE}posts/${id}/`} ``。RSS item 的 link 用相对路径（不带开头 `/`）。
- 站内统计（TOTAL/字数/字节）全部由 `src/lib/site.ts` 从 posts 实时计算，无需手改。
- deploy 走 `.github/workflows/deploy.yml`（GitHub Pages，push main 触发）；`wrangler.jsonc` 是遗留的 CF 备选，当前不用。
- 改 `astro.config.mjs` 的 `site`/`base` 时，同步改 `src/lib/site.ts` 的 `SITE.url`。

# 写作风格

见本目录下 writing.md
