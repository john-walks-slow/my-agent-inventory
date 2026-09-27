# R2 用户反馈改造 总结

2026-09-27 R2 轮：用户对初版站点的 12 条反馈，11 条落地、1 条按用户决定搁置。

## 逐条结果

| # | 反馈（原意） | 处理 | 状态 |
|---|---|---|---|
| 1 | 「秘籍」改名「指令」；阅读器页头只留书名 | vocab：stardew tomes→「指令」（其他主题保留风味名）；reader 删页头标题 | ✅ |
| 2 | 深度解析去掉「📜 深度解析」标题，正文直渲 | 保持 yaml+md 拆分（长文编辑体验、git diff 干净、fork 者各司其职）；UI 无标题直渲 | ✅ |
| 3 | 品质用通用分级 rare 之类 | `common/rare/epic/legendary` 全量替换（harness.yaml 61 处 + example + CSS token + schema.md 文档） | ✅ |
| 4 | 工具需要 schema，最好自动生成 | `scripts/collect-dsh-tools.mjs`：mock cordis ctx 加载 dsh 核心包 + 宿主 profile 插件捕获 defineTool 定义 → `parameterSchemaSpecToJsonSchema` → `config/schemas/*.json`（24/24）；mnemon 两枚从产物源码字面量提取；validate 加覆盖校验；详情卡渲染参数表 + JSON 折叠 + 复制 | ✅ |
| 5 | ⚙ 配置示例也要可复制 | DetailPanel install/config/schema 三块各自 CopyBtn（copiedKey 状态防互串） | ✅ |
| 6 | badge 去段位名去星星；jrpg 参考 FF 重做 | badge 无 levelTitle/★；jrpg 深蓝渐变 #1a2a5e→#0e1636、近白框 #dce4ff、青 EXP #58b8f0、金 chips #ffd868（含 bgGradient 支持） | ✅ |
| 7 | 左上角角色 status；点头像看档案；档案可分享名片 | 顶栏=头像+昵称+Lv+称号+迷你 EXP 条（点击开档案）；档案弹窗加职业/安装日期行 + 「分享名片」复制 `#/badge` 链接 | ✅ |
| 8 | 尝试自动判断职业 | `src/stats/job.ts`：主导 section → 主题化职业名（plugins/skills/mcp/tools/tomes 五职业 × 四主题），平票取配置顺序前 | ✅ |
| 9 | 主题名去游戏指涉 | 用户拍板「先不改了」 | ⏸ 搁置 |
| 10 | 「入坑日期」→「安装日期」 | vocab `since` 四主题统一「安装日期」 | ✅ |
| 11 | 品牌图标不像正牌 | simple-icons@16（CC0）160 栅格降采样像素化 5 枚（claude-code/copilot/cursor/gemini-cli/opencode）+ 亮度自适应描边；OpenAI（商标已移除）/goose/amp 无收录保留手绘 | ✅ |
| 12 | 宝可梦字体显式乱码 | 根因=上游 pkmn_r cmap 空映射（有映射无字形→渲染空白）；换 w 字重（唯一小写全量有墨）+ `tools/prep-pkmn-font.py` 修 OS/2 倒挂/剥 25 空映射 + `scripts/font-probe.mjs` 验证 94/94 ASCII 有墨 | ✅ |

## 关键技术点

- **mock cordis ctx 收集工具 schema**：深度 stub + 三类注册路径（`tools.register` / `inject+effect` / `agents.roots`）+ `parameterSchemaSpecToJsonSchema`；宿主插件（dsh-set-model、dsh-clear-mind 等）与核心包同法收编；effect 必须单次执行且吞桩异常（否则中断同 inject 块的后续注册）。
- **cmap 有映射 ≠ 有字形**：pkmn 系字体多数字形是空轮廓，浏览器渲染为空白；修复以「有墨字形」为准。
- **PKMN 子集取舍**：badge 内嵌子集缺 `#%*<=>{}` 9 符号回退系统字体，可接受。

## 验证

- 单测 35/35（新增 job.test、vocab 新键、badge 布局断言）；lint 0；validate 24/24 schema；privacy:scan 0/0
- e2e 冒烟：四主题截图、PKMN 混排、bash 参数表（7 参数+必填标）、档案 DOM 断言、badge 四主题、375 移动端，零 console 错误
- 用户验收项见 [260927-r2-feedback.validation.md](./260927-r2-feedback.validation.md)
