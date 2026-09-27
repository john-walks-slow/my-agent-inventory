# 发布到 GitHub Pages

## 前置检查

```bash
pnpm validate && pnpm build && pnpm test && pnpm privacy:scan
```

全绿再走发布。badge/favicon 在 `prebuild` 钩子里自动生成，无需手动跑。

## 步骤

1. **推送仓库**

```bash
git add -A && git commit -m "feat: fill my harness inventory"
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

2. **开启 Pages（一次性）**

GitHub 仓库页 → **Settings → Pages → Build and deployment** → Source 选 **GitHub Actions**（不是 Deploy from a branch）。

3. **触发部署**

选了 GitHub Actions 后，推送到 main 会自动跑仓库自带的 workflow（Node 22 → `pnpm build` → 上传 `dist/` → 部署）。
在仓库 **Actions** 标签页看进度，绿勾后约 1 分钟站点生效：

```
https://<you>.github.io/<repo>/
```

## 常见问题

- **404**：确认 Source 选的是 GitHub Actions 且 workflow 首次运行成功；`<repo>` 名大小写敏感。
- **资源 404 / 白屏**：站点部署在子路径 `/<repo>/`，本项目 vite `base` 已按仓库名自动处理——仓库名改过的话检查 `vite.config.ts` 的 `base`。
- **自定义域名**：Pages 设置里填 CNAME 后，badge 地址跟随新域名。

## 领取 badge

部署成功后，四枚主题名片地址为：

```
https://<you>.github.io/<repo>/badges/stardew.svg
https://<you>.github.io/<repo>/badges/pokemon.svg
https://<you>.github.io/<repo>/badges/jrpg.svg
https://<you>.github.io/<repo>/badges/diablo.svg
```

默认展示主题由 `site.theme` 决定（另有 `/badge.svg` 跟随它）。站内 `#/badge` 页有 URL / Markdown / HTML 嵌入片段的一键复制，直接把人类引过去。
