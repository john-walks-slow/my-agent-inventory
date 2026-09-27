# harness.yaml 全字段参考

唯一事实源为 `src/config/schema.ts`（zod strictObject：**多余字段会报错**，不认识的键不要写）。
改完随时 `pnpm validate`。YAML 陷阱：`version` / `since` 这类值**加引号**，避免被解析成数字/日期对象。

## 顶层结构

```yaml
site:      # 站点信息
harness:   # harness 档案（谁在背这个包）
sections:  # 背包分区（Tab）数组，至少 1 个
```

## site

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | string | ✅ | 站点标题（index.html 标题也由它驱动） |
| `subtitle` | string |  | 副标题 |
| `theme` | `stardew`\|`pokemon`\|`jrpg`\|`diablo` |  | 默认 `stardew` |

## harness

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | ✅ | harness 全名，如 `Claude Code` |
| `nickname` | string |  | 昵称（HUD/档案弹窗展示） |
| `brand` | string |  | 内置品牌头像 key：`dsh` `claude-code` `codex` `cursor` `goose` `amp` `gemini-cli` `copilot` `aider` `opencode`，缺省 `generic` |
| `customAvatar` | string |  | 自定义头像：`config/icons/` 下文件名（不含扩展名），优先于 `brand` |
| `version` | string |  | harness 版本，如 `'1.5.0'`（加引号） |
| `since` | string |  | 启用日期 `YYYY-MM-DD`，**必须加引号** |
| `stats` | object |  | 见下 |
| `level` | int 1-99 |  | 显式等级覆盖；缺省由锚点公式按 stats 自动计算 |

### harness.stats（均可选）

| 字段 | 说明 |
|---|---|
| `sessions` | 主会话数（root 口径，不含子代理） |
| `subagentSessions` | 子代理会话数（档案彩蛋） |
| `tokens` | 累计 Token（**非缓存** input+output 口径） |
| `cacheTokens` | 缓存命中 Token |

口径细节与采集见 `harnesses/*.md`。数值取整，YAML 大整数直接写阿拉伯数字即可。

## sections[]

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | id | ✅ | 小写字母/数字开头，允许 `- _ .`；全局唯一，同时是 Tab 与目录名 |
| `label` | string |  | Tab 显示名（缺省用 id） |
| `icon` | string |  | Tab 图标，走与 item 相同的图标解析链 |
| `view` | `grid`\|`reader` |  | `grid`（默认，背包格）/ `reader`（典籍阅读器） |
| `categories` | array |  | 筛选分类定义 `[{id, label}]`，id 在 section 内唯一 |
| `items` | array | ✅ | 装备条目 |

## sections[].items[]（装备条目）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | id | ✅ | section 内唯一；同时决定正文文件名 `config/content/<section>/<id>.md` |
| `name` | string | ✅ | 显示名 |
| `title` | string |  | 副标题/中文称号 |
| `icon` | string |  | 图标引用（解析链见 `icons.md`） |
| `rarity` | `common`\|`rare`\|`epic`\|`legendary` |  | 品质（星级+边框色），默认 `common` |
| `category` | string |  | 筛选分类 id，**必须已在本 section 的 categories 中定义** |
| `stack` | int ≥1 |  | 堆叠数（格子上角数字） |
| `version` | string |  | 该装备自身版本 |
| `author` | string |  | 作者 |
| `repo` | string |  | 仓库链接 |
| `install` | string |  | 安装命令块（plugins/mcp/有仓库的 skill 才填，如 `pnpm add ...` 或 `claude mcp add ...`） |
| `config` | string |  | 配置示例块（插件给宿主配置片段——cordis.yml / settings.json hooks 等；MCP 给 mcpServers JSON） |
| `description` | string | ✅ | 一句话摘要（格子悬停/详情卡顶部） |
| `highlights` | string[] |  | 亮点列表（详情卡） |
| `tags` | string[] |  | 标签 |
| `note` | string |  | 人类真实备注（默认不出现，主题化命名） |
| `added` | string |  | 收录日期 |

## 校验规则（validate 会查）

- section id / section 内 item id / section 内 category id 各自唯一
- `item.category` 必须指向同 section 的 categories
- 正文体 `config/content/<section>/<id>.md` 与 item 一一对应（缺失/多余都报）
- `icon` 引用必须可解析（custom → kit → 兜底，引用了不存在的 custom 文件会报）
- strictObject：任何拼写错误的字段名直接报错

## reader 型 section（典籍）

`view: reader` 的 section 渲染为羊皮纸阅读器书架：每个 item 是一本「典籍」，正文取 `config/content/<section>/<id>.md`，支持多级标题与代码块。适合放踩坑经验、方法论长文。grid/reader 可以混用同一个站里。
