# 隐私分级与 privacy:scan

## 三级分类

### 🔴 绝不入库（任何形式都不出现）

- 真实 API Key、Token、密码、私钥（`sk-…`、`ghp_…`、`xox…`、`AKIA…`、`AIza…` 等）
- Webhook secret、2FA 恢复码
- 含有效凭据的配置文件本体（如直接拷贝的 `.env`、`settings.json` 带认证段）

写安装示例时一律用占位符：`<your-api-key>`、`demo-token`。

### 🟡 建议脱敏（出现前改为占位或删除）

- 公网隧道域名、真实域名（→ `<your-domain.com>`）
- 内网 IP（→ `192.168.x.x`）、公网 IP（→ `203.0.113.x` RFC 5737）
- 个人 home 路径（`/home/<user>`、`/Users/<user>`、root 家目录下的 `.agents` 等非通用路径 → 一律改写为 `~/`）
- 手机号、邮箱、真实姓名

### 🔔 人工复核（工具无法判断，呈报人类定夺）

- 用户名/昵称出现在叙述性正文里
- 项目名、仓库名是否愿意公开关联
- `harness.stats` 的真实数字（发布前人类确认）
- 截图、badge 中带出的任何环境信息

## pnpm privacy:scan

```bash
pnpm privacy:scan            # 全仓扫描
node scripts/privacy-scan.mjs --allow example.com   # 追加豁免域名（当次）
```

- **硬模式**（密钥形态：私钥块、`sk-`、`ghp_`、`github_pat_`、`xox`、`AKIA`、`AIza`、`SECRET=…` 赋值形态）：命中即 `exit 1`，发布前必须清零。
- **软模式**（域名、IP、个人 home 路径）：警告不阻断，逐条人工判断是否脱敏。
- 已知占位符（`<your-api-key>`、`demo-token`、`mock-token` 等）自动豁免。
- 跳过目录：构建产物与第三方资产（`public/badges`、`src/iconkit/assets`、字体、`baseline/` 截图等）。

## .privacy-allow 豁免文件

仓库根 `.privacy-allow`，每行一个**公共**域名（支持后缀匹配），`#` 开头为注释：

```
# itch.io 资产商店链接
itch.io
githubusercontent.com
```

只豁免你确认**可以公开出现**的公共站点域名。任何含个人信息的域名不要写进来。

## 铁律

1. `privacy:scan` 通过 ≠ 免责——软警告逐条人工判断，闸门仍是「与人类对齐」那一步。
2. 脱敏从源头做起：写文档时直接用占位符，而不是先写真的再扫。
3. 采集器只读本机数据；**采集结果进入配置前**同样过一遍三级分类。
