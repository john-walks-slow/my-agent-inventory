# dsh-aivn

<p align="center">
  <a href="https://github.com/john-walks-slow/dsh-aivn/blob/HEAD/README.md"><strong>简体中文</strong></a> ·
  <a href="https://github.com/john-walks-slow/dsh-aivn/blob/HEAD/README.en.md"><strong>English</strong></a>
</p>

把 AIVN 的舞台引擎装进 DSH。

一个**工作区就是一部剧目**：在里面开会话、选「剧作家」预设，对话页就多一个「AIVN」tab
（**只给剧作家会话**——搭台助手的会话里没有这个 tab），
剧作家写的 Stage DSL 被实时演出来——背景、立绘、台词条、停止点选项都在这里；玩家点一条选项，
这句话回到剧作家手上，它接着往下写。

![AIVN tab：背景、立绘、台词条，右下角是语音开关与「重听这句」](https://raw.githubusercontent.com/john-walks-slow/dsh-aivn/master/screenshots/screenshot-1.png)

> **这是 AIVN 的 DSH 适配版。** 同名的 [`stage-ai`](https://github.com/john-walks-slow/aivn)
> 是**独立版**（自包含桌面应用 / 独立 Web 站）。两者共用同一套引擎与领域
> （`@aivn/core`、`@aivn/stage`），差别只在宿主：独立版有路线树、周目存档与完整工坊，
> 这边用 DSH 的原生会话、文件侧栏与技能机制。**想要完整产品体验用独立版；
> 已经在用 DSH、想要 AIVN 能力而不另开一个应用，用这个插件。**

## 装

包是 DSH 的 bundle（`package.json` 里声明了 `dsh.bundle.patch`）：

```bash
dsh plugin --profile web add dsh-aivn
```

从 GitHub 直装也行——`lib/` 是**跟踪的构建产物**，所以不需要构建脚本、也不会触发
pnpm 的 `allowBuilds` 拦截：

```bash
dsh plugin --profile web add github:john-walks-slow/dsh-aivn
```

- **手工挂**：在 profile 的 `cordis.patch.yml` 里加一行：

```yaml
- insert:
    - id: dsh-aivn
      name: dsh-aivn
      config: {}
```

- **客户端半边**（「AIVN」tab）挂在 `conversation.view` 槽上，需要 `dsh-web-app`。它在
  `package.json` 的 `dsh.client{platform:"web"}` 里声明，不走 Loader。

可配的有六处——**语音**、**联网检索**、**生图**、**配乐**、**命令行**、**按预设禁用工具**；前五项都不配也能照常跑（只是那几项能力没有，对应工具不注册、提示词不提），禁用项默认空。

两种改法，改完都**就地生效**（不用重启 dsh）：

- **界面**（推荐）：侧边栏 **Plugins → dsh-aivn** 里的配置卡。分两段——P0 决定能力开不开（Key 与后端），P1 是默认就能用的口味项；顶部一行状态灯显示当前哪几项能力是开的。密钥只写不回显，卡片上另有「清除已存 Key」。
- **配置文件**：profile 的 `cordis.patch.yml`。界面保存的也是这里边——两种改法落在同一份配置上。

```yaml
- id: dsh-aivn
  name: dsh-aivn
  config:
    ttsKeys: ["<your-fish-audio-key>"]     # 多把可轮询，摊免费额度（界面上逗号分隔）
    ttsBaseUrl: https://api.fish.audio      # 默认值，一般不用写
    ttsModel: s2.1-pro-free                 # 默认值
    ttsConcurrency: 2                       # 同时合成的上限
    searchKeys: ["<your-exa-key>"]          # 给了它搭台助手才有 web_search
    searchBaseUrl: https://api.exa.ai       # 默认值
    shell: false                            # true = 给搭台助手放开 bash
    imageFormat: gemini                     # gemini | openai | modelslab（接口格式，不是产品名）
    imageBaseUrl: http://127.0.0.1:38000    # 本机 flow2api；官方 API 或别的网关填它自己的地址
    imageModel: gemini-3.0-pro-image
    imageSize: 1K                           # 1K / 2K / 4K（K 大写），或字面像素 1536x1024
    imageApiKey: ""                         # 本机网关不校验就留空（留空 = 不带鉴权头）
    imageTimeoutMs: 180000
    musicBaseUrl: http://127.0.0.1:38000
    musicModel: flow-music-lyria-3.5
    musicApiKey: ""
    musicTimeoutMs: 240000
    nsfwModel: ""                           # 限制级通道的专用模型（provider/model 最稳）；逐剧目可用 play.json 覆盖
    nsfwPrompt: ""                          # 限制级创作指引后面的补充口径；逐剧目可用 play.json 覆盖
    playwriterDisabledTools: ""             # 按预设禁用工具（逗号分隔的工具名），默认空 = 两预设一致
    stagehandDisabledTools: ""
```

**配置面是扁平的 21 个字段**（DSH 设置界面的控件只认顶层字段，嵌套写法它寻址不到）：

| 配置项 | 默认 | 给了会怎样 | 环境变量兜底 |
|---|---|---|---|
| `ttsKeys` | 空 | 舞台有语音开关，两个预设多一个 `list_voices`（音色库与合成共用这池 key） | `DSH_AIVN_TTS_KEYS` |
| `ttsBaseUrl` / `ttsModel` / `ttsConcurrency` | Fish 官方 / `s2.1-pro-free` / `2` | — | — |
| `searchKeys` | 空 | 两个预设多一个 `web_search`（一次调用同时拿回结果与正文） | `DSH_AIVN_EXA_KEYS` |
| `searchBaseUrl` | `https://api.exa.ai` | 换代理 / 镜像时改 | — |
| `shell` | `false` | 两个预设的 `tool-bash` 行真装上（默认关，与 AIVN 的 `defaultOff` 同口径）。**bash 是预设的「一行」，只对新建会话生效** | — |
| `imageFormat` / `imageBaseUrl` / `imageModel` | — | **地址与模型都给齐**才有 `generate_image` / `generate_asset`（两个预设都有）；`cut` / `import_asset` 不依赖它。格式是接口协议形状，不是产品名 | — |
| `imageSize` | `1K` | 档位 `1K`/`2K`/`4K`（K 大写）或字面像素 `1536x1024`；gemini 格式只认档位，openai/modelslab 两种都收（modelslab 封顶 1024） | — |
| `imageApiKey` / `imageTimeoutMs` | 空 / `180000` | 本机网关不校验就把 key 留空（不带鉴权头）；出图慢就把超时调大 | — |
| `musicBaseUrl` / `musicModel` | — | 都给齐才有 `generate_bgm`（只有 Gemini 形状，没有 `format`） | — |
| `musicApiKey` / `musicTimeoutMs` | 空 / `240000` | 同上；一首曲子实测约 84 秒 | — |
| `nsfwModel` | 空 | 限制级通道的**专用模型**：写 `provider/model` 最稳（如 `cpa/某模型`），只写模型 id 会在已注册的 provider 里找；留空 = 进通道不换模型（提示词照旧切）。逐剧目可用 `play.json` 的 `agents.playwriter.nsfwModel` 覆盖 | — |
| `nsfwPrompt` | 空 | 限制级创作指引后面的**补充口径**；逐剧目可用 `play.json` 的 `agents.playwriter.nsfwPrompt` 覆盖 | — |
| `playwriterDisabledTools` / `stagehandDisabledTools` | 空 | 按预设禁用工具（逗号分隔的工具名，取值为「Agent 工具」清单里的工具名）。默认空 = 两预设工具面完全一致 | — |
| 抠底调参 | 见「素材生成」 | `DSH_AIVN_CUTOUT_TOLERANCE` / `_KEY_SMOOTH` / `_EDGE_BAND` / `_SPILL` / `_SOLID_RESIDUAL` 五个环境变量 | 同名环境变量 |

key 两处都没有 = 那项能力停用：工具**不注册**、提示词里也不提。两个预设、一条 `/new-play` 命令、
`/aivn` 路由都是固定的，不可配。

改完的配置由 loader **原位提交**进运行中的引用，插件据此重建能力面：那一轮的工具装/卸、搭台助手
提示词里门控的那几章、语音后端，**开着的会话下一轮就用新的**；唯一例外是 `shell`——它翻的是预设行集，
已开着的会话保持原样，新建一个才吃到。

> 开发期 `@aivn/core` 与 `@aivn/stage` 走 `file:` 依赖（指向 stage-ai 仓库）。发布版换成版本号。

## 用

1. 新建会话，在座位 chip 上选 **剧作家**（备料的那位是 **搭台助手**）。
   预设是**在会话开始时**定下的，中途换不了——想换就新建一个会话。
2. 会话的工作目录根要有 `play.json`。没有的话舞台会明说「这个会话的工作目录里没有 play.json，
   还不是一座剧目」——那就先把它立起来，见下。
3. 说一句话开演。之后的一切都在舞台上发生——**那句话会把剧目的开局指令（`opening`）一并带给剧作家**，
   所以不必照着剧本念开场白，随便说句什么（「开始吧」）就行。

「AIVN」tab 是会话头部的第三个 tab（Chat / Trajectory / AIVN），**只在这个会话是剧作家预设时出现**。

#### 新会话怎么进舞台

输入框上方那行里，「剧作家」chip 右边有一枚**「开始游戏」**——选好「剧作家」预设，工作目录里
也有 `play.json` 的时候它就出现。按一下：

1. 把剧目的开局指令（`play.json` 的 `opening`，缺省「（游戏开始，请演出第一轮）」）投给剧作家
   ——与舞台上那枚「开演」按钮发的是同一条消息；
2. 剧作家起笔、页签列被带出来的那一刻，**这一页自己切到 AIVN**。

只替你切这一次：之后手动切回 Chat 不会被抢回来。切过之后这个选择由 DSH 自己记住
（同一个会话再打开、刷新页面，都还在舞台上）。

> 为什么需要这一枚：会话还没发过任何消息时，DSH 连页签列都不画，所以那时候**没有「AIVN」可点**。
> 「开始游戏」正是替你把「发第一句话」和「切到舞台」合成一次点击。

不想用它也行：自己在输入框里说一句话，然后点「AIVN」tab，效果一样。

### 全屏

舞台**左上角**有一枚「全屏」键（右上角是导演工具栏）。按下去整块舞台——画面、台词条、
演出工具栏一起铺满屏幕：

- 桌面与 Android 走浏览器的原生全屏，连状态栏一起收掉。退出按那枚键（字面会变成
  **「退出全屏」**），或按浏览器自己的 **Esc**。
- **iPhone 上的 Safari 不支持元素全屏**（只有 iPad / macOS 的 Safari 支持），那一档自动退到
  「铺满视口」：盖住 DSH 界面，但收不掉 Safari 自己的地址栏——这是该平台给得出的上限。

玩家按了 HIDE（净画面态）时这枚键跟着台词条一起藏起来。

### 导演工具栏（提示 / 改写 / 重写）

舞台右上角那排键是给**导演**用的，三轮动作都走宿主侧的同一条路：

| 动作 | 它会做什么 | 什么时候能点 |
| --- | --- | --- |
| **提示 · 引导** | 把这句话排进剧作家的**下一轮**。正在演的这一拍不受影响，停止点还在，玩家照选不误 | 随时 |
| **提示 · 打断** | 先停下正在写的这一轮，再用这句话接着写 | 随时 |
| **改写** | 把**最后一步**写出来的内容作废，让剧作家按你交代的那句重写一遍（弹窗里预填的是当前这一句，改完提交） | 不在写的时候 |
| **重写** | 把**这一拍**整段作废，让剧作家重新写（指令可留空 = 纯重写） | 不在写的时候 |

两件要紧的事：

- **改写 / 重写和 AIVN 那边的同名功能不是一回事**。AIVN 有一份自己的脚本模型，「改写」是直接改
  那一行脚本、不经过模型；DSH 这边的剧本就是剧作家的输出、会话日志才是权威，所以「改这一句」
  只能是**让剧作家重写这一拍**：插件往会话里追加一条替换标记（`surfaceOp.replace`，与
  `dsh-rewind` 同一个手法），被作废的那一段从上下文里真的消失，模型看不到旧内容。
  代价是一次重写要花一轮 LLM（AIVN 的原地改写不花），换来的是**上下文不会和画面对不上**。
- **生图不在这一排**：出图在搭台助手那条会话里做（`generate_asset` / `generate_image`），舞台这排键点了也没有落点，
  所以不摆。

导演说的话带自己一支来源（`dsh-aivn-director`），**不会变成一行玩家台词**：舞台的时间线上
只有玩家真正说过的话。剧作家那边由系统提示词的《演出契约》第 7 条交代「（导演…」是片场喊话。

### 限制级（NSFW）通道

剧情推进到亲密 / 成人内容时，剧作家调 `enter_nsfw` 把这一段交给**限制级专用模型**（插件配置
`nsfwModel`，逐剧目可用 `play.json` 的 `agents.playwriter.nsfwModel` 覆盖；留空 = 不换模型）。
进通道后：

- 提示词换成《限制级（NSFW）创作指引》（含剧目的 `memory/always/nsfw.md` 与补充提示词），
  并先投一条合规声明；舞台左上角亮起「限制级」角标；
- 退出走 `exit_nsfw`：引擎用**主模型**把这一段改写成 1-3 句全年龄摘要，再把这一段从
  **模型可见面**上折掉——此后主模型只看得到那句摘要，而**日志与舞台照旧留着原文**；
- 中途进出、冷开、分支、回退都从会话日志重推：段内重建角标照样亮，退出之后不再亮。

对模型来说这一段读作「已收束为一句摘要」；对人类这边什么都不藏。

### 回退与分支：舞台跟着会话走

- **回退**（`dsh-rewind` 的「回退到这里」）：它往会话里追加一条替换标记，插件收到就把舞台
  **整段重投影**一遍——回退之后刷新或重新打开，「AIVN」tab 演到的就是你回退到的那个点。
- **在新对话中分支**（DSH 原生的分支）：新会话带着父会话的前缀，插件这边不做任何事——
  第一次打开它的舞台时，帧流里一帧都没有，插件就从会话面重铺一遍，于是新会话停在**分叉那一刻**
  （连同那一刻的停止点）。
- 插件**不做**自己那一套谱系分支（AIVN 的路线图 / 旧枝那套）：要分岔就用 DSH 原生的两样。

### 进行中浮层

右上角那枚「进行中」徽标（有东西时才出现）里是两样：**排队中的提示**（还没进会话的那些）
与**正在合成的语音**。出图与配乐不在里面——插件里它们是同步的工具调用，没有回合之外的作业可报。
玩家按了 HIDE 时它跟着舞台一起收起来。

### 起一座新剧目

工作区里没有 `play.json` 就是「这还不是一座剧目」：**写一份出来就是立起一座剧目**，没有生成器。
字段与布局写在两个预设的提示词里（《剧目文件》那一章，同一段文本），模型用文件工具直接写。

- **人**：输入框敲 `/new-play 雨中的旧校舍`。不给剧目名就取工作目录名——这一步替你写 `play.json`
  与骨架文件，不花一次 LLM 往返。
- **Agent**：照《剧目文件》写。搭台助手备料时就顺手立起来了。

`/new-play` **只写不存在的文件**：`play.json` 已经在那儿就直接报错（这里已经是一座剧目，
要起新的就换一个空目录开会话），`memory/always/premise.md` 与角色卡已经写好就跳过、
在回执里列成「保留」。落下的骨架就是下面那张目录表里的前几行——之后缺什么补什么。
写完想知道对不对，让搭台助手调 `validate_play`。

## 一部剧目长什么样

工作目录根就是剧目根：

```
play.json                          剧目配置（唯一的必填文件）
memory/always/premise.md           世界观前提
memory/always/craft.md             文风与禁忌（散文，只能拿话说）
memory/always/state/scene.md       当下场景（剧作家自己写）
memory/always/state/threads.md     未了线索（剧作家自己写）
memory/always/state/state.json     好感度与旗标（同上：好感度是 0~100 的整数，键是角色 id）
characters/<id>.md                 角色卡
assets/backgrounds/…               背景
assets/cg/…                        插图
assets/sprites/<id>/…              立绘：每个主体一个目录
assets/sfx/…  assets/bgm/…         音效与音乐
assets/manifest.json               素材描述表：素材 id → 一句话画面
endings.json                       结局账本（引擎维护、跨周目累加；不要手改）
```

### play.json

必需字段只有两个：

```json
{ "id": "my-play", "title": "我的剧目" }
```

其余字段（全部可选）：

| 字段 | 作用 |
| --- | --- |
| `opening` | 开局那条 user 消息的正文。玩家在这条会话里说第一句话时，它与那句话一起发给剧作家；空舞台上的「开演」按钮发的也是它。缺省 `（游戏开始，请演出第一轮）` |
| `characters` | `[{ id, name }]`。**只用来给台词条配名字**：立绘绑定在角色卡的 frontmatter 上 |
| `craft` | 写作参数，见下 |
| `initialState` / `initialScene` | 剧目的起始状态与起始场景 |
| `newGamePlus` | 多周目开关（缺省 `false`）。开启后，同工作区新开的会话（新周目）会在提示词里注入此前已达成的结局，见「结局与多周目」 |
| `scriptLanguage` | 剧本语言（ISO 639-1）。缺省跟随玩家说什么话 |
| `voiceLanguage` / `defaultVoiceId` / `cover` | 语音与封面：属于 AIVN app，本插件当前不读 |
| `image` | `{"model": "…", "size": "2K"}`：**这座剧目自己的出图模型与档位**，覆盖部署级设置（两个字段各覆盖各的，留空即跟随部署配置）。比如一部剧要更高分辨率、另一部的小剧场插图 1K 就够 |
| `agents` | agent 运行设置：属于 AIVN app，本插件当前不读 |

### 结局与多周目

故事走到真正的终点时，剧作家把那一轮的**最后一行**写成结局标签（它**取代**那一轮的 `<stop>`）：

```xml
<ending id="true_sunrise" name="晨光" subtitle="这一次，她没有回头"
         summary="她把三年的沉默一次说完，然后走进了那片光里。"/>
```

`<ending/>` 是**纯归档标签、不产生任何画面**：`id` / `name` / `subtitle` / `summary` 四个字段
全部只进账本、一条都不上屏。终幕画面（若有）由剧作家自己用现成的 `<scene>` / `<title>` /
`<narrate>` 搭——每部戏想要的终幕本来就不一样。

到达结局后舞台进入**终局态**：不给任何按钮、不能继续，也不出现「点击舞台继续」，
想再玩只能走 DSH 的「在新对话中分支」（回到结局之前）或新建一条会话。

结局由**引擎**自动记到工作区根的 `endings.json`：跨周目累加、按 `id` 去重、`reachedIn` 记它在第几周目
达成。这份账本引擎独占，**不要手改**。

`play.json` 打开 `newGamePlus` 后，同工作区**新开的会话**（新周目）开头会把此前已达成的结局注入
剧作家的提示词，让它安排多周目要素（角色隐约记得、某些路线 / 选项不同）。引擎只保证账本可见，
**不强制解锁任何内容**——怎么用完全由剧作家决定。新周目开始时引擎会把 `memory/always/state/`
三个状态文件重置回起点（`premise.md` / `craft.md` / 记忆索引 / 角色卡都不动）。

### characters/&lt;id&gt;.md

一张角色卡就是一份 Markdown，可选 frontmatter：

```markdown
---
name: 林
sprite: lin
voice: 短句，少用形容词
---

十七岁，话少，习惯先看窗外再看人。
```

- `name` —— 台词条上的名字。
- `sprite` —— 绑到哪个立绘目录（`assets/sprites/<sprite>/`）。不写就是角色自己的 id。
  立绘是**立绘自己的事**：`characters/` 可以没有立绘，`sprites/` 也可以没有卡。
- `body` —— 人设正文。

### assets/manifest.json

剧作家认 id 认不出画面，靠这份描述：

```json
{
  "veranda": { "description": "黄昏时分的走廊，木地板反着暖光" },
  "lin/normal": { "description": "林，常服，平静的神色" }
}
```

**键是素材 id，不是路径**——不带目录前缀，也不带扩展名。写成 `backgrounds/veranda.png`
不会报错，只是永远匹配不上，剧作家会以为这件素材没有描述。三种键形：

| 素材 | 键 |
| --- | --- |
| 背景 / 插图 / 音效 / 音乐 | 文件名去掉扩展名（`veranda`） |
| 立绘（整主体） | 立绘目录名（`lin`） |
| 立绘（单个差分） | `<立绘目录名>/<差分名>`（`lin/normal`） |

值里除了 `description` 还能写 `tags`、`title`、`framing`、`stature`、`anchor`
（立绘摆位），音乐还能写 `mood`、`scene`、`durationSec`、`loop`、`volume`。

背景、插图、音效、音乐按扩展名白名单收（png/jpg/jpeg/webp/mp3/ogg/wav/m4a）；立绘按
`sprites/<主体id>/` 分目录，每个目录里的第一个文件是找不到指定差分时的兜底。

### craft：写作参数

`play.json` 的 `craft` 段，三个字段都可不写（不写 = 引擎默认）：

| 字段 | 取值 | 默认 |
| --- | --- | --- |
| `beatLength` | `short` / `medium` / `long` | `medium` |
| `stopOptions` | `two` / `three` / `four` / `free` | `three` |
| `assets.background` | `library-first` / `library` / `generate` | `library-first` |
| `assets.cg` | `library` / `generate` / `off` | `generate` |
| `assets.sprite` | `generate` / `off` | `generate` |
| `assets.audio` | `library` / `off` | `library` |

`free` = 固定停在自由输入框，不给选项面板。

**素材来源四类是给剧作家的意向指令**：引擎按这四项把「缺素材时怎么办」写进剧作家的《写作参数》——例如 `cg: off` 让它别写 `<cg>`、`background: generate` 让它自己出图。注意两点：

- **没有跨剧目素材库**（应用级 `library/` 永久不做）：`library` / `library-first` 里「用库」那一支永远走不到，会退化成「用本剧目已有的 / 出图」；
- **生图那几支还要看有没有配生图后端**：没配时会自动改成「用已有素材或旁白交代」，不会教剧作家去调一个不存在的工具。

文风、禁忌、称呼习惯这类只能拿话说的口径写在 `memory/always/craft.md`，不在 `play.json` 里。

**这一段用 `edit` 定点改**（只动 `craft` 这一个键，文件里其余部分一个字节都不碰）。工具里没有
`set_craft`：写文件就是写文件。写错的值引擎**静默当没写**——改完让搭台助手调 `validate_play`，
它会把不认的取值报出来。

### theme.json：舞台皮肤

剧目根可以放一份 `theme.json`，改这座剧目的舞台外观：键就是 `@aivn/stage/stage.css` 里
`.stage-root` 上的 CSS 变量名，值过白名单校验。**不放这份文件就是默认皮**——一个变量都不注，
画面与从前逐像素一致。

```json
{
  "--dialog-bg": "linear-gradient(178deg, rgb(16 14 20 / 0.94), rgb(8 7 10 / 0.96))",
  "--dialog-ink": "#f4eee0",
  "--stage-bg": "#0b0a12",
  "--stage-radius": "6px",
  "--accent": "#8a5cf6",
  "--accent-ink": "#f7fbff",
  "--font-ui": "\"Noto Serif CJK SC\", serif"
}
```

十七个可设置的键，分五组：

| 组 | 键 | 取值 |
| --- | --- | --- |
| 台词条 | `--dialog-bg` | 颜色，或 `linear-gradient(<0–360>deg, <颜色>, <颜色>)` |
| | `--dialog-line`、`--dialog-ink`、`--dialog-ink-soft`、`--dialog-ink-thought`、`--dialog-ink-faint` | 颜色 |
| | `--dialog-shadow` | `none`，或 `0 10px 30px rgb(0 0 0 / 0.45)` 这样的「x y 模糊 颜色」 |
| 衬底与圆角 | `--stage-bg` | 颜色（图片未到或加载中露出的底） |
| | `--stage-radius` | `0px`–`24px` |
| | `--sprite-dim` | `0.2`–`1`（1 = 非发言人立绘完全不压暗） |
| 选肢卡 | `--choice-bg`、`--choice-line`、`--choice-ink` | 颜色 |
| 字体 | `--font-ui` | 逗号分隔的字体名，整串 ≤ 200 字符 |
| 主色 | `--accent`、`--accent-ink`、`--accent-soft` | 颜色 |

颜色写法：`#rgb` / `#rrggbb` / `#rrggbbaa` / `rgb()` / `rgba()` / `hsl()` / `hsla()`（空格与逗号两种
参数语法都认）。不认颜色名、`var()`、`calc()`、`url()`——这条通道收的是**值**，不是 CSS 文本。

两个入口：

- **让搭台助手改**：把想要的基调说清楚，它调 `set_stage_style` 写文件，写完立刻把新皮肤推给
  同一座剧目已经打开的舞台（不用刷新）。不给参数调用一次 = 看当前生效值与默认值对照。
- **自己手改**：改完刷新页面或切一次会话生效（手改不广播）。

白名单外的键与非法值，手改时只丢那一项，工具调用时整次拒绝（一个字节都不写）；文件整个坏掉时
舞台回默认皮、剧目照常开演。

## 两个预设

| id | 名字 | 干什么 |
| --- | --- | --- |
| `aivn-playwriter` | 剧作家 | 实时写 Stage DSL 的那位；它的输出被接进舞台 |
| `aivn-stagehand` | 搭台助手 | 备料：写设定、角色卡、创作口径、挑音色、出图与入库、配乐、查资料 |

两个预设的行集**同构**：persona（就是那份提示词）+ 文件工具 + 文件检索 + 一份**私有**技能库
（自带的 `skills/`，见下）+ 一行默认关的 `tool-bash`（`shell: true` 才真装上）。
**工具面也完全一致**（见「Agent 工具」），角色差别只剩 persona、注入内容与舞台管线。
**预设里不会再列一行 `dsh-aivn`**——宿主已经装了本插件，再来一行会把路由与事件订阅重复装一遍。

两个预设**不吃宿主的技能与指令**：`dsh-agent-instructions` 一行不装——web 部署里宿主那一行本身
也是关的，所以 `$DSH_HOME/AGENTS.md` 与工作区的 `AGENTS.md` 都不进提示词（剧目上下文全由 A 区注入；
直出 `dsh-base` 的剖面里宿主那一行还在，那一层得在剖面里自己关）。技能库挂在自己的 `isolate`
realm 里，宿主行与第三方插件注册的全局技能都不会漏进清单。

只有剧作家预设的会话会进舞台管线。搭台助手说什么都不上台。

### 技能库（两个预设）

插件自带三份做法速查，随包发布（`skills/`），装进两个预设的会话：

| 技能 | 讲什么 |
| --- | --- |
| `aivn-play-setup` | 起新剧目 / 改设定的四步做法与各文件写法（premise / craft.md / craft 段 / 角色卡 / 记忆卡 / 素材表）、craft 取值、备料顺序，以及演出中引入新主体（建档 / 立绘 / 临时角色） |
| `aivn-visual-craft` | 画风锚点写在哪、角色外形怎么锁（头身比 / 五官 / 服装）、差分布局与命名、图单怎么写、可直接粘贴的生图提示词写法，以及演出中缺图当场补图与入库 |
| `aivn-audio` | 免费 BGM / 音效去哪里找、哪档授权能商用、六大场景与常见音效类别的选源、再分发与 AI 训练红线，以及配了音乐后端时用提示词出曲的写法 |

清单进 system prompt（只列名字与一句话），模型觉得对上了才加载全文——三份都是长篇，不该每轮全读。
技能库是**私有**的（挂在自己的 `isolate` realm 里，`includeDefaultRoots: false`）：宿主上那几十个
本机运维技能、以及第三方插件代码里注册进来的技能，都不该挤进这两个预设的清单。

**做法正文放在 skill，persona 只留一句指针**：改做法直接改 `skills/*.md`（改完即生效，不必重建
`lib/`），常驻提示词也更瘦。能力位门控的那几章（缺图、配乐）保留在 persona——skill 清单不受能力位
约束，若整章下沉，没配后端的实例会读到教它调不存在工具的正文。分层规约见 `AGENTS.md` 的「提示词地图」。

## 上下文注入

剧作家的系统提示词由两部分拼成，中间夹着**每轮注入的剧目上下文**——剧作家不需要自己去
`ls` + `read` 一圈就知道这部戏的设定、有谁、有什么素材、现在演到哪儿：

| 段 | 内容 | 来源 |
| --- | --- | --- |
| 静态前半 | 身份、怎么工作、剧目在哪 | `persona` 的 `prefix` |
| 《剧本语言》 | 正文用哪种语言写 | `play.json` 的 `scriptLanguage` |
| 《剧目设定》 | 世界观前提 | `memory/always/premise.md` |
| 《角色表》 | 每张卡的正文 + 音色 + 立绘差分；只有立绘没有卡的主体单列一节 | `characters/*.md` |
| 《素材清单》 | 背景 / 音乐 / 音效 / 插图的 id + 描述；有音乐音效时附编排规则 | `assets/` + `assets/manifest.json` |
| 《写作参数》 | 每轮多长、给几条选项、素材来源，外加创作口径散文 | `play.json` 的 `craft` + `memory/always/craft.md` |
| 《记忆索引》 | 每张设定卡一行（分类 / 标题 / 路径 / 摘要） | `memory/index/**` |
| 静态后半 | 剧本格式（Stage DSL）、结局与多周目、记忆卡与世界状态、演出契约；外加两句指针——引入新角色（指向 `aivn-play-setup`）、缺图怎么办（指向 `aivn-visual-craft`，配了生图才在） | 插件注册的尾段（`playwriterTail`） |
| 《限制级创作指引》 | 进通道后给创作指引（含剧目自己的 `memory/always/nsfw.md` 与补充提示词）；没进通道时只有一句**入口指针**（教它什么时候调 `enter_nsfw`） | 插件注册的段 `aivn:play-nsfw`，按通道现值逐轮切 |
| 【状态】 | 场景、好感度、旗标、活跃剧情线（每轮变化的 user 角色快照） | `memory/always/state/*` |

这些段**只挂给剧作家的会话**（注册在 Agent scope 上），搭台助手看不到舞台契约。
快照按秒级 TTL 缓存：一个 turn 里的多个 step 读到同一份，跨轮自然重读。
改完文件不用做别的，下一轮就生效。

**搭台助手的注入是另一套**（同样注册在它自己的 scope 上）：

| 段 | 内容 | 来源 |
| --- | --- | --- |
| 《剧本语言》 | 给演出看的内容用哪种语言写（与用户对话仍是中文） | `play.json` 的 `scriptLanguage` |
| 《当前状态》 | 剧目文件清单（路径 + 大小，三层深）+ 开演条件报告 | 工作目录 + `readiness` |

它不需要舞台契约（不写剧本），也不需要角色表那种逐条展开——它要的是「现在盘上有什么、
还缺什么」，刚写完文件下一轮就看得见。

## Agent 工具

工具跟着预设装、跟着预设卸。`validate_play` 两个预设都有；其余按角色分。
**剧作家的停止点不是工具**：它是剧本正文最后一行的一个标签——`<stop options="甲 | 乙"/>`（选项面板）、
`<stop placeholder="…"/>`（自由输入框）、`<stop/>`（这一段自然演完）。轮尾因此是一条助手消息，
DSH 的「在新对话中分支」与舞台重建（只重放助手文本）都认得上。**故事真正的终点改用 `<ending/>`**
（同为末行标签、取代那一轮的 `<stop>`，见「结局与多周目」）。
**模型用文件工具就能做的事一律没有**：`play.json`、`craft` 段、`memory/always/state/` 都是文件工具
写出来的，写成什么样由提示词说清（见上「起一座新剧目」）；「这座剧目有什么素材」也一样——
剧作家的 A 区每轮注入《素材清单》与《角色表》（id + 描述），搭台助手看《当前状态》的文件清单、
要描述就 `read assets/manifest.json`。

**两个预设装同一套 AIVN 工具**（工具清单见 `src/tool-catalog.ts`）；「门控」列只有配了对应后端 / key 才注册的项。
按预设禁用某几个工具，用插件配置 `playwriterDisabledTools` / `stagehandDisabledTools`（逗号分隔的工具名，默认空 = 两预设完全一致）。

**独立的事放同一批**：一条 assistant 消息里发几个互不依赖的调用（读几个文件、出几张图、抠几张底），
一轮往返就能办完几件事；其中 `read` 与素材类工具（出图 / 抠底 / 登记 / 配乐 / 检索）声明了**可重叠**，
DSH 把它们放进同一个并行池，等待不叠加。`set_stage_style`（读-改-写 `theme.json` 且没有锁）与 `enter_nsfw` / `exit_nsfw`
（翻会话态并广播，一拍才调一次）是那几只不能重叠的 AIVN 工具；宿主自带的 `glob` / `grep` / `write` / `edit` / `bash` 也独占
（同批只省往返，等待照样逐个来）。开关是 `src/tool-catalog.ts` 里每个工具的 `concurrent` 声明
（缺省即独占），装配时由 `withConcurrency` 落成工具定义上的 `isConcurrencySafe`。

| 工具 | 门控 | 作用 |
| --- | --- | --- |
| `validate_play` | — | 剧目自查：`play.json` 读不读得出来（缺字段、坏 JSON、值不合法会给原因）、`craft` 里有没有引擎不认的取值、状态文件好不好、故事前提、角色卡张数、立绘、背景、素材条数、出图台账里有没有指向不存在文件的登记。刚写过剧目文件之后调它。**没有硬门槛**，缺什么都能开演。**两个宿主的这份报告是同一份**（判据与文本都在 `@aivn/agent` 的 `play.readiness`） |
| `set_stage_style` | — | 写剧目根的 `theme.json`（舞台皮肤：台词条、选项卡、衬底、圆角、字体、主色），写完把全量皮肤推给同剧目已打开的舞台。三态：省略 = 不动、给值 = 改、`null` = 回默认；不带参数调用 = 看当前值。值格式与可设置的键见上 |
| `generate_image` | 生图后端 | **只出候选**：一段画面描述 → 一张**候选图**（回执给文件路径与预览），**不抠底、不登记**。给了 `kind`（background / cg / sprite）就走剧目感知的那条路——按落位拼提示词后缀、落草稿区、画幅跟着 `framing` 走；不给 `kind` 就是不绑剧目的通用候选，画幅用 `aspectRatio`（默认 16:9）。`references` 可垫主体 id / 剧目内路径 / http(s) 网址。落成素材另走 `cut` / `import_asset`（或直接 `generate_asset`） |
| `cut` | — | **抠底**：纯色底的图 → 透明 PNG（只写输出，**不改源图**）。`source` 给剧目内相对路径，`output` 不给就写到候选区。五档调参见下（`tolerance` / `spill` / `edgeBand` / `keySmooth` / `solidResidual`）。立绘登记前先跑它；抠脏了就对着**同一张**源图重调再跑。**不依赖生图后端** |
| `import_asset` | — | 把一张**图登记**成剧目素材：写 `assets/`、补素材表（呈现声明 + 描述）、记台账，**不抠底**。`source` 给剧目内相对路径或 http(s) 网址；落位**显式给**——`kind`（background / cg / sprite）必填，立绘再给 `spriteId` / `variant` / `framing` / `stature` / `title`。立绘要传**已抠好的透明 PNG**（外部来源先 `cut`）；`original` 可留抠底前原片以便重抠。**不依赖生图后端** |
| `generate_asset` | 生图后端 | **一键**：出图 +（立绘）自动抠底 + 登记，一次完成，回执给最终素材路径。参数与 `import_asset` 的落位一致（`kind` + `name` / `spriteId` / `variant` / `framing` / `stature`），立绘另收 `keyColor`（色键底色，见下）。**只有这条路**由引擎自动做色键底、身份锁、差分垫 neutral；同名素材已有则直接跳过 |
| `generate_bgm` | 音乐后端 | 生成一首 BGM 落 `assets/bgm/`；**同步等待**（约 84 秒），`name` 就是剧本里 `<scene bgm="…">` 引用的 id。**只出曲子、不带元数据**：标题 / 描述 / mood / scene / loop 出完用 `annotate_asset` 标（见下一行） |
| `annotate_asset` | — | 给**已入库**的素材补 / 改元数据：`title` / `description` / `tags` / `mood` / `scene` / `loop` / `volume`，主体用 `kind`（background / cg / sprite / bgm）+ `name`（立绘给 `spriteId`，可带 `variant`）。只改给出的那几格，其余原样保留；描述是剧作家挑素材的依据、mood / scene 是它选曲的依据。**不依赖任何后端** |
| `list_voices` | `tts.keys` | 查 Fish 音色库挑音色：按语言 / 标签 / 标题关键词取窗口，本地按 `gender` 筛，按热度排序，一页 25 条（`page` 从 1 起，结果末尾会提示下一页）。挑好的 id 填进角色卡的 `voice` |
| `web_search` | `search.keys` | 联网检索：一次调用同时拿回结果与正文。只查剧目之外的事实——设定、角色、剧情都在工作区文件里 |
| `enter_nsfw` | — | 进限制级通道：这一段交给限制级专用模型（配置 `nsfwModel`），提示词换成创作指引并投一条合规声明，舞台亮起角标。**只在剧作家的工具面上**（搭台助手不写剧情） |
| `exit_nsfw` | — | 出限制级通道：引擎用主模型把这一段改写成全年龄摘要，再把这一段从模型可见面上折掉；舞台角标熄灭 |

`list_voices` / `web_search` / `generate_image` / `generate_asset` / `generate_bgm` 在没配对应 key / 后端时
**不注册**，提示词里也不提它们。**`validate_play` / `set_stage_style` / `cut` / `import_asset` 不门控**：
它们只读写剧目文件、跑抠底，不碰生图后端——所以没配生图也能用外部工具出图、`cut` 抠底、`import_asset` 登记。
文件工具（`read` / `write` / `edit` / `glob` / `grep` / `read_image`）由预设的行集提供，两个预设都有。

## 素材生成

「**像素从哪来**」和「**像素怎么变成剧目素材**」是两步，工具也是分开的：

- **一键（`generate_asset`）**：出图 +（立绘）自动抠底 + 登记，一步到位——「就想要一张能用的图」走这条。
- **原子三件套（`generate_image` / `cut` / `import_asset`）**：各自单一职责，可自由组合——
  要出候选让用户挑、图来自别处（下载 / 别的模型）、或要单独重抠时走这条。

| | 一键（`generate_asset`） | 原子（`generate_image` → `cut` → `import_asset`） |
| --- | --- | --- |
| 来源 | 配置的生图后端 | `generate_image` 的候选 / 剧目内路径 / http(s) 网址 |
| 剧目感知 | 自动做色键底、身份锁、差分垫 neutral、抠底 | 无：立绘的纯色底要自己在 prompt 里写清，抠底单独调 `cut` |
| 落位 | 参数显式给（kind / 主体 / 差分 / 取景体量） | `import_asset` 的参数显式给 |
| 入库 | 一步到位 | 分步：`cut` 抠底 → `import_asset` 登记 |

出图**同步等待**（一次 70–140 秒）。「一次出多张候选让用户挑」= 同一目标多调几次 `generate_image`
（**放进同一批**，并发跑，等待不叠加），把预览贴给用户；挑中的那张再落位——背景 / 插图直接 `import_asset`，
立绘先 `cut` 再 `import_asset`。**没被挑中的候选不在素材表里留痕。**

### 目录与台账

```
play/
├── assets/                       ← 剧目素材，进 git
│   ├── generated.json            ← 出图台账：每张图当初用的 prompt（只增，不覆盖别人的键）
│   └── manifest.json             ← 素材描述与立绘呈现声明（framing / stature / title）
└── media-cache/                  ← 中间物，不进 git，整目录删掉不心疼
    ├── drafts/<草稿id>/{image.*, source.*, draft.json}
    ├── sprite-sources/<主体id>/  ← 立绘抠底前的原片（`import_asset` 的 `original` 与自动补 neutral 落这里；重抠从它取）
    └── tts/                      ← 语音缓存（内容寻址）
```

草稿留 7 天，由下一次出图顺手清掉。`.gitignore` 建议至少加一行 `media-cache/`
（`assets/` 要进 git——那是剧目内容）。

### 候选图怎么给用户看

不新增 HTTP 路由：**回执与回复里贴 markdown 图片，路径是工作区内的绝对路径**
（`![候选](/abs/path/to/play/media-cache/drafts/<id>/image.png)`）。DSH 的对话界面会把它渲染成
内联预览（点开有大图），草稿与素材都在会话工作区（= 剧目根）里，所以这条路对草稿与入库后的
素材一样有效。工具回执里直接给好这一行，persona 要求模型把它贴进回复——「出 3 张候选让用户挑」
这条流程的前提就是用户真的看得见那三张。

### 立绘：取景、体量与抠底

- **取景 `framing`** 决定出图画幅与舞台摆位：`full` 9:16 / `half` 3:4 / `square` 1:1。
  人物用 `full` 或 `half`，猫、道具这类非人主体用 `square`（「全身/半身」是给人形用的词）。
  同一个主体要保持同一档：声明写进 `assets/manifest.json` 的 `<主体id>` 键（整个主体共用的那一层），
  某条差分与它不同时另写一条 `<主体id>/<差分名>`。立绘级取景**以 `neutral` 那次为准**——
  它是所有差分的垫图基准，一条 closeup 不该把整个主体的摆位带跑。
- **体量 `stature`**（`small` / `normal` / `large` / `huge`）只管台上站多大，与取景是两件事：
  机甲是「全身取景 + 巨大」，猫是「方形取景 + 小」。
- **色键底色 `keyColor`**（`green` / `magenta`，默认 `green`）是引擎拼进定妆照提示词的那个色值：
  `green` 纯绿 `#00FF00`、`magenta` 纯品红 `#FF00FF`。**颜色是显式传的，不由生图模型自己挑**——
  抠底是全局色键（离底色够近的像素一律算背景），所以底色一旦与角色配色撞上，角色身上那片颜色会被一起抠掉：
  **主体自己是绿色系（绿发 / 绿衣 / 绿瞳）时必须给 `magenta`**，别的情况不用给，也不要在 prompt 里自己写底色。
  这一项只决定定妆照（`neutral`）的底色；差分跟着垫图的底色走。
- **抠底**：立绘必须是透明 PNG。走 `generate_asset` 时引擎自动抠（色键底 + 全局色键 + 边缘覆盖率
  反解，`src/media/cutout.ts`）；走原子路径时在 `generate_image` 出候选后调 `cut`。**底色必须是饱和的
  色键色**：整圈边框量出的底色通道极差 <96（白底、浅灰底、照片底）会当场报错让你重出，不再静默抠穿
  ——白底当色键会把浅色处抠成洞，`despill` 还会压错通道把画面抹灰。抠不干净时**不要重新出图**——
  重画出来是另一张画：对**同一张源图**重调 `cut` 的参数再跑（源图在 `media-cache/sprite-sources/<主体id>/`，
  或 `import_asset` 时用 `original` 留底）。五档调参对应五个环境变量：

| 环境变量 | 默认 | 作用 |
| --- | --- | --- |
| `DSH_AIVN_CUTOUT_TOLERANCE` | `48` | 色键容差。**调大 = 抠得更狠**，也会连发丝一起啃掉 |
| `DSH_AIVN_CUTOUT_SPILL` | `20` | 限色：压掉边缘残存的底色（发丝一根不少）。边上还有底色残留先调它 |
| `DSH_AIVN_CUTOUT_EDGE_BAND` | `4` | 反解带宽，边缘出现硬白圈时加 |
| `DSH_AIVN_CUTOUT_KEY_SMOOTH` | `0.8` | 色键降噪：源图 JPEG 环纹在轮廓上啃出缺口时加 |
| `DSH_AIVN_CUTOUT_SOLID_RESIDUAL` | `48` | 实心判据。描边被吃掉时**调小**它 |

### 三种生图格式差在哪

| `format` | 端点 | 垫图 | 尺寸 |
| --- | --- | --- | --- |
| `gemini` | `/v1beta/models/{model}:generateContent` | ✅ 多张（`inlineData`，官方 / flow2api / cpa 都认） | 只认档位 `1K`/`2K`/`4K` |
| `openai` | `/v1/images/generations` | ❌ 这个接口没有参考图入参，带垫图直接报错 | 字面 `WxH`（档位由插件算，守住官方上限） |
| `modelslab` | `/images/text2img` 与 `/img2img` | ✅ 一张（先传 `base64_to_url` 换托管链接） | 单边封顶 1024，档位按长边顶满 |

**垫图是角色一致性的唯一可靠手段**：非 `neutral` 的立绘自动垫该主体已入库的 `neutral` 定妆照
（prompt 措辞锁不住脸）。所以同一个主体的差分顺序是：先出定妆照、挑一张入库，再派生别的差分。
**分辨率是配置的事**（`imageSize` / 逐剧目 `play.json` 的 `image.size`）：引擎不按素材类目自动抬档，
立绘也一样跟着配置走。要注意的是各格式的能力上限不同——`modelslab` 单边封顶 1024，
`openai` 认字面尺寸，只有 `gemini` 认 `1K`/`2K`/`4K` 档位。

垫图（`references`）收三种写法：**主体 id**（自动用它已入库的 `neutral` 立绘）、**剧目内相对路径**、
**http(s) 网址**（现下到内存里，不落盘：带内网/回环/云元数据拒答，每个重定向跳都重判，单张上限
20MB）。背景与插图垫多个主体时，引擎会把「第几张是谁」写进提示词——图片本身没有名字，不点明
的话多人同框会各画各的：不报错、图也好看，只是七濑长成了澪。

剧作家这条路上另有两道自动处理：

- **已有同名素材直接跳过**：回执告诉你「已经有了」并给出引用写法，既不覆盖旧图也不烧配额；
- **差分缺定妆照时先自动补一张 `neutral`**（一批并发只补一次，回执里把这张一起给你）。
  但如果该主体**已经有别的差分**、只缺 `neutral`，会报错让你先过目——新补的脸与旧差分不是
  同一个人，演出中会静默换脸。

**逐剧目的模型与档位**走 `play.json` 的 `image` 段（`{"model": "…", "size": "2K"}`），
不填就跟部署级设置；这个覆盖对两个角色的出图都生效。

## 斜杠命令

| 命令 | 作用 |
| --- | --- |
| `/new-play [剧目名]` | 把当前工作目录立成一座剧目（写 `play.json` 与骨架文件）。不花 LLM 往返 |

命令对所有会话可见（DSH 的命令不分预设），在哪个会话里敲就在那个会话的工作目录里落地。
它**只新建、从不覆盖**：已经有 `play.json` 就报错，其余骨架文件已存在就跳过并列进回执。

## 宿主 HTTP 面

浏览器半边只跟这几个口说话，全部按会话分频：

| 路由 | 说明 |
| --- | --- |
| `GET /aivn/health` | `{ ok: true, plugin: "dsh-aivn" }` |
| `GET /aivn/play?session=` | 这个会话的剧目：`{ dir, config, voice, theme }`；不是剧目就是 `{ dir: null, voice: false }`。`voice` 说明宿主配没配 TTS，客户端据此决定显不显示语音开关；`theme` 是剧目皮肤（CSS 变量名 → 值），空对象 = 默认皮 |
| `GET /aivn/assets?session=` | `{ index, manifest }`；不是剧目 404 |
| `GET /aivn/asset?session=&path=` | 剧目内的一件素材。`path` 是**相对剧目根**的路径（如 `assets/backgrounds/x.png`），越界 400 |
| `GET /aivn/audio?session=&file=` | 一句台词的合成音频。文件名是 `sha1(模型 + 音色 id + 文本)`，内容寻址，所以可以长缓存 |
| `GET /aivn/stream?session=` | SSE，`event: frame`，data 是一帧 `StageFrame` JSON。连上先补推已经播过的帧，15 秒一次 keepalive |
| `POST /aivn/input { session, text, silent? }` | 玩家的一次输入，投给剧作家。`silent: true` = 不算玩家说的话（舞台的「继续」走这条），仍然会作为一条 user 消息投出去；**会话已结局时回 409**（终局态不接受继续，出口是分支或新会话） |
| `POST /aivn/direct { session, action, text, from? }` | 导演的一次动作。`action` ∈ `guide`（提示·随下一轮）/ `interrupt`（提示·打断）/ `rewrite`（改写或重写）；`rewrite` 的 `from` ∈ `line`（作废最后一步）/ `beat`（作废整拍，缺省）。这些消息带 `dsh-aivn-director` 来源，不当玩家台词 |
| `POST /aivn/voice { session, enabled?, paused? }` | 语音总开关与客户端背压。`enabled: false` 让服务端停止分句合成（省额度），`paused` 是播放层积压时的临时背压 |

`StageFrame` 有六种：

```ts
{ seq, kind: 'ir',    event: StageEvent }   // DSL 解析出的 IR
{ seq, kind: 'beat',  state: 'start' | 'end' }  // 剧作家起笔 / 停笔
{ seq, kind: 'voice', lineSeq, phrase, state: 'started' | 'ready', url? }  // 语音
{ seq, kind: 'style', theme: Record<string, string> }  // 剧目皮肤（全量快照，幂等）
{ seq, kind: 'reset' }                      // 前面推的一切作废，紧接着的帧才是现在的样子
{ seq, kind: 'guide', items: { id, text, status: 'pending' | 'sent' }[] }  // 提示队列（全量快照）
```

`style` 帧推给**同一座剧目**的所有会话流：写皮肤的是搭台助手，看舞台的是剧作家会话，
只推自己那条流用户就得刷新才看得见。

`reset` 是**重投影**：回退、改写 / 重写、分支会话第一次打开时，宿主把会话面（`session.surface`，
模型真正看得见的那串事件）重新铺成一条完整帧流推过来。客户端认出它就把播放层归零、按 `resetToken`
整段重放，再逐帧应用后面那些。**`seq` 只增不回退**：客户端按「seq 比上一帧大」去重，重建帧的号
必须比之前那个大，归零会让它们被整批丢掉。提示队列的 `guide` 帧紧随 `reset` 之后：队列在导演手里、
不在会话面上，重置之后要跟着回来。

**语音跟着播放头的节奏走**：一句台词的音频要 2–5 秒才合成回来（Fish 免费模型的实测值），
而舞台是手动推进的——停在这一句上的时间够长就听得到，点太快点过去的那一句会被丢弃
（这是引擎本来的设计：不给已经翻过去的行补声音，免得和下一句叠在一起）。
播放层的「重听这句」是对应这条的补法。

合成的音频落在剧目自己的 `media-cache/tts/`：文件名是 `sha1(模型 + 音色 id + 文本)`，内容寻址，
所以重连补推、快进回看、重听都命中同一份、不会再打一次上游。这份缓存**只增不减**（换了模型或改了
一个字就是新文件），随时可以整个目录删掉，下次演出会重新合成。

`voice` 帧的 `lineSeq` 是**那一行 `say_start` 帧的 seq**（不是本帧的 seq）——音频按它挂回台词行。
`started` 用来让喇叭亮起来（还在合成），`ready` 带上可播的 URL。台词与音频是并行出的：
文字先上屏，声音好了接上，接不上就静音演完（合成失败只打一行告警，不阻塞演出）。

**玩家输入不在这条流里由路由写入**：`/aivn/input` 只负责投递，落点只有一处——宿主监听
`agent/inbox/inserted`，于是 DSH 原生输入框与舞台的选肢卡走同一条路，既不会各写一条，也不会漏写。
引擎自己投的那些（开局指令、`silent` 的空推进）也走这条路，按 `message.id` 认出来摘掉，
不会变成一行玩家台词。

`/aivn/*` 是插件自己注册的前缀路由，**在 DSH 的浏览器信任栅栏之外**（那道栅栏只管 `/api`）：
`POST /aivn/input` 与 `POST /aivn/direct` 只收同源请求（`Origin` 与 `Host` 对不上就 403）且要求
`content-type: application/json`，免得跨站页面替玩家投一句输入、或者替导演作废一段上下文。

## 权限与兼容

- **网络**：出网只有四处——配了 TTS key 时打 Fish Audio（`api.fish.audio` 或你配的 `baseUrl`，
  音色库查询与语音合成共用），配了 `search.keys` 时打 Exa（`api.exa.ai` 或你配的 `baseUrl`），
  配了 `image` 时打生图后端，配了 `music` 时打音乐后端（后两者的地址完全由你配的 `baseUrl` 决定，
  默认不预置任何厂商地址）。四项都没配就一个请求都不发。其余功能全在本地。
- **文件**：读写在会话的工作目录（也就是那座剧目的目录）内。工具与 `/new-play` 只在你指定的
  目录里建剧目文件；语音缓存、出图草稿、立绘留底原片写在 `<剧目>/media-cache/` 下
  （都是中间物，可随时整目录删除）。不碰工作目录以外的路径。
- **命令行**：`shell: false`（默认）时搭台助手那一行 `tool-bash` 是关的，它没有命令行；
  开成 `true` 才有——那时它能跑的东西不再受文件工具的路径约束，自己权衡。
- **HTTP**：往 DSH 的 web server 注册 `/aivn/*`（剧目读写、素材、SSE 事件流、音频）。
  四个写接口都走同源 + `content-type: application/json` + 字节上限 + JSON 四道闸；
  `/aivn/audio` 只接受目录内的纯文件名（`basename` 判定 + `.mp3` 白名单），不接受任何路径。
- **密钥**：TTS 与 Exa 的 key 只从配置或环境变量读，不进日志、不进 URL、不进 git；错误文案里
  最多带上游返回的前 200 字符。
- **兼容**：宿主半边对齐 `dsh` `0.1.7-rc.2`，客户端半边对齐 `0.1.1-rc.2`。「AIVN」tab 需要
  `dsh-web-app`（挂在 `conversation.view` 槽上）。

## 开发

**前置**：`@aivn/core` 与 `@aivn/stage` 现在走 `file:` 依赖，指向兄弟仓库
`stage-ai` 的 main 检出（两个包都在它的 `packages/` 下）：

```
~/projects/
├── dsh-aivn/            ← 本仓库
└── stage-ai/
    ├── packages/core/    （@aivn/core）
    └── packages/stage/   （@aivn/stage）
```

这两个包**只在构建期**用得到：esbuild 把它们打进 `lib/`，运行时不依赖。
所以**装插件的人不需要它们**（`npm i` 只装 `dependencies`），只有想从源码重建才需要。

```bash
npm install         # 需要上面那两个兄弟目录在位
npm run build       # lib/index.js（宿主半边）+ lib/client.js（浏览器半边）
npm run typecheck
```

`lib/` 是**受跟踪的产物**，改完 `src/` 必须重建并一起提交。忘了重建时本地一切正常、别人装上才炸，
所以有一条自查，它同时挂在 `pre-commit` 钩子上（用同一套构建参数在内存里重打一遍，与仓库里的
`lib/` 逐字节比对，不落盘）：

```bash
node build.mjs --check        # 手动跑
git config core.hooksPath .githooks    # 每个 clone 各做一次，之后提交前自动拦
```

宿主半边（`lib/index.js`）与兄弟仓无关，永远硬判；客户端半边（`lib/client.js`）把 `@aivn/stage`
打进了包，所以只在兄弟检出**干净**时硬判，否则只警告——那时不一致多半是别人正在改那只包。

`lib/` 是**跟踪的构建产物**：DSH 直接加载它，所以改完 `src/` 必须重建再提交。
`npm publish` 前会跑 `prepublishOnly`（重建 + 类型检查），保证发出去的和源码一致。

### 发新版

```bash
npm run release                                            # 重建 + typecheck + bump patch + 打包
node ~/.agents/skills/npm-publish/scripts/publish-webauthn.cjs /tmp/dsh-aivn-<新版>.tgz   # 指纹发布
git push --follow-tags                                     # 版本提交与 tag 上 GitHub
```

版本语义：修 bug 用 patch、加功能用 minor、破坏性改动用 major。

### e2e

```bash
dsh-e2e start --wait-ready     # 起一个最小实例（dsh-base + dsh-web-app + 本 worktree）
npm run e2e:stage              # 跑舞台套件「stage」
dsh-e2e stop
```

实例 home 在 `<worktree>/.dsh-e2e-home`，不进 git。两个本地前提（都在那个 home 里，不在仓库里）：

- **要有可用的 LLM provider**：home 的 `settings.yaml` 首次启动会被 import 后改名，此后冷启就
  没有 provider 了。把你线上 profile 里那条 provider（`llm-*`）补进
  `.dsh-e2e-home/profiles/web/cordis.patch.yml`，并 export 它用的 API key 环境变量——
  否则 GUI 会被「Add an API key to get started」挡住，会话也发不出消息。
- **默认模型挑一个你这台机器出得去的**：这份模型列表里可能有地区受限的条目（报
  `User location is not supported` 那种）。e2e 不挑具体模型，能通就行。

套件：

- `stage`（`npm run e2e:stage`）——在工作区根落一份临时剧目夹具 → 新建会话并选「剧作家」预设 →
  发一句 → 断言「AIVN」tab 挂载、导演工作栏是三格（提示 / 改写 / 重写，没有生图）、台词逐字上屏、
  停止点出来、点选项后原文被投给剧作家并在时间线上落成一行回执、剧作家接着写完第二轮。
- `director`（`npm run e2e:director`）——导演工具栏与舞台重投影：导演栏三格、「提示」的两岔是
  引导 / 打断、引导进队列又进会话且**不落成玩家台词**、改写往会话里追加替换标记、舞台收到
  `reset` 帧并整段重投影、剧作家重写这一拍，以及原生「在新对话中分支」出来的新会话里舞台
  也从会话面重铺到同一个点。判据取自会话日志的会话面折叠与自挂的 SSE 探针。
- `injection`（`dsh-e2e run e2e/verify-injection.mjs`）——剧作家的上下文注入：从会话日志断言
  A 区六段与【状态】都进了系统提示词、内容取自夹具文件而不是「自己去读」，并核对工具面
  （两个预设装同一套 AIVN 工具、素材清单不进工具面——它在注入段里）。
- `stagehand`（`npm run e2e:stagehand`）——搭台助手：断言 persona 章节、《当前状态》注入
  （文件清单 + 就绪报告）、随包技能库三份都在技能清单里、工具面与剧作家一致
  （两个预设同一套）。e2e 实例**没配生图与音乐**，所以这里同时断言那两个能力的工具
  **不在**工具清单里、persona 里也**不提**它们（未配后端时不谎报能力）。
- `voice`（`dsh-e2e run e2e/verify-voice.mjs`）——真打 Fish Audio：断言 voice 帧到达、音频能取回
  且是真 MP3、**浏览器把它解成了 PCM 并真的有音源起播**（在页面里给 `AudioContext` /
  `decodeAudioData` / `AudioBufferSourceNode.start` 挂钩子，不是看帧猜的），以及语音总开关
  确实传到了宿主。跑之前要 export `DSH_AIVN_TTS_KEYS`。
- `style`（`dsh-e2e run e2e/run.mjs style`）——剧目皮肤：先离线对表（白名单 17 键、取值校验、
  读闸，以及令牌表与 `@aivn/stage/dist/stage.css` 的默认值逐键一致），再上真舞台：没有
  `theme.json` 时一个变量都不注且计算样式等于默认皮；写一份皮肤后重挂会话，内联变量与计算样式
  跟着变；文件里混进坏键只丢那一项。最后让**另一个会话里的搭台助手**调用 `set_stage_style`，
  断言已打开的舞台不刷新就换装（跨会话广播）。
- `entry`（`dsh-e2e run e2e/run.mjs entry`）——「开始游戏」与全屏：搭台助手会话上那一枚**不**出现；
  空白剧作家会话上它紧挨在剧作家 chip 右边同一行；按一下就**把 START 投给剧作家并落到舞台上**——
  START 是不是真发出去了，判据取**会话日志**里的那条玩家消息（与 `opening` 那段同一个手法），
  不是看 HTTP 响应；选中的页签确实是 AIVN。全屏那边：键在舞台左上角，按下去
  `document.fullscreenElement` **就是舞台那一层本身**（不是某个内部元素——那会把台词条留在屏幕外），
  字面翻成「退出全屏」，再按还原。只花那一拍的 LLM，比 `stage` 便宜。

截图落在 `e2e-artifacts/`（不进 git）。

## 社区

- 感谢 [LINUX DO](https://linux.do/) 社区提供的交流环境。
