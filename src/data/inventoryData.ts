import type { InventoryItem, BookDocument } from '../types/inventory';

export const PLUGINS_DATA: InventoryItem[] = [
  {
    id: 'dsh-wait-subagent',
    name: 'dsh-wait-subagent',
    chineseName: '子代理收敛同步器',
    category: 'plugins',
    subCategory: 'tools',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'hourglass',
    customColor: '#9d4edd',
    description: '阻塞等待指定后台后台子代理（continuable subagent）执行完毕并提取其终结输出。',
    longDescription: `【核心解决的痛点】
DeepSeek Harness 原生的 subagent 工具在开启 \`run_in_background: true\` 时只返回 durable id，之后父 Agent 只能通过持续轮询 \`list_agents\` 或等待系统异步发送 Notice。在多子代理流水线、并行调研汇聚、严格串行审查等场景下，极度缺乏确定性的阻塞等待机制。

【核心特性】
1. 精准等待：传入 subagent_id 即可优雅阻塞直到该子代理 settle，返回其 stop_reason 与 closing message。
2. 超时安全：支持毫秒级超时设置，防止子代理发生死循环或耗尽 token 导致父进程永久挂死。
3. 状态直显：直接解析 finished、aborted、max-tokens 等终止状态，父 agent 可立即接续后续决策。`,
    version: '1.0.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-wait-subagent',
    installCommand: 'dsh plugin install dsh-wait-subagent\n# 或本地链接开发:\ncd ~/plugins/dsh-wait-subagent && pnpm link --global',
    configExample: `// cordis.yml 注入配置
plugins:
  dsh-wait-subagent:
    timeout_ms: 180000 # 默认超时 3 分钟`,
    tags: ['Subagent', 'Async', 'Workflow', 'Must-Have'],
    docId: 'agent-async-orchestration',
    highlights: ['告别愚蠢轮询', '支持毫秒超时保护', '精准提取 closing message', '多 Agent 流水线基石'],
    tips: '在 orchestrate 多个独立子任务时，并行启动 3 个 background subagent，随后依次 wait_subagent，能将总耗时缩减 60%！',
    createdDate: '2026-08-12'
  },
  {
    id: 'dsh-clear-mind',
    name: 'dsh-clear-mind',
    chineseName: '思维蒸馏与上下文收敛',
    category: 'plugins',
    subCategory: 'core',
    rarity: 'iridium',
    stackSize: 99,
    iconType: 'sparkles',
    customColor: '#3a86ff',
    description: 'Agent 自主上下文剪枝与压缩检查点工具，把长会话蒸馏成精简快照。',
    longDescription: `【背景与价值】
大模型在长轮次复杂推理或编码中，上下文会迅速充斥大量已验证失败的尝试、冗长的错误堆栈和中间调试日志，导致 KV Cache 庞大、注意力漂移、成本飙升。

【核心机制】
- \`mind_map\`: 审视当前上下文表面每一条消息的 token 权重、seq id 与角色分布。
- \`clear_mind\`: Agent 主动指定起始 seq 与结束 seq，并在其中写入高度结构化的压缩 Checkpoint（保留用户原始意图、关键路径、放弃方案、未决事务），一键折叠历史！
- 客户端与宿主零污染：折叠操作在下次会话请求前生效，人类端完整对话保留，Agent 上下文重获新生。`,
    version: '2.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-clear-mind',
    installCommand: 'dsh plugin install dsh-clear-mind',
    configExample: `clear_mind:
  auto_threshold_steps: 50
  default_compaction: minimal`,
    tags: ['Context Management', 'KV Cache', 'Cost Saver', 'Core Architecture'],
    docId: 'agent-context-pruning',
    highlights: ['Agent 自主压缩', '保留结构化检查点', '降低 70% Token 消耗', '杜绝注意力涣散'],
    tips: '当单个任务解决超过 30 步或遇到复杂排错死胡同时，先 mind_map 找出无用历史，立即 clear_mind！',
    createdDate: '2026-07-20'
  },
  {
    id: 'dsh-web-transport-trust',
    name: 'dsh-web-transport-trust',
    chineseName: 'Web 传输宿主鉴权解锁',
    category: 'plugins',
    subCategory: 'core',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'shield-check',
    customColor: '#06d6a0',
    description: '突破浏览器同源与 loopback 限制，使公网命名隧道等远程环境享有完整宿主管理权限。',
    longDescription: `【核心问题】
在 Termux / 容器化环境通过公网隧道（如 Cloudflare Named Tunnel、noVNC 或移动端局域网）访问 DSH Web GUI 时，DSH 默认出于安全策略会将外部 IP 判定为非 loopback（只读或受限模式），导致设置页面变灰、无法保存 Provider Key 或修改全局配置。

【解决方案】
本插件向前端 index 注入 \`globalThis.__DSH_TRANSPORT__ = { ownsHost: true }\`，让经鉴权的远程会话完全拥有本地 Host 权限，真正实现随时随地远程控制手机/服务器上的 DSH 实例。`,
    version: '0.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-web-transport-trust',
    installCommand: 'cd ~/plugins/dsh-web-transport-trust && pnpm link --global',
    tags: ['Remote Access', 'Auth', 'Tunnel', 'DevOps'],
    docId: 'remote-tunnel-security',
    highlights: ['全域远程写权限', '适配 Cloudflare Tunnel', '零破坏侵入'],
    tips: '务必配合具有 HTTP Basic Auth 或 Cloudflare Access 的反向代理使用，避免暴露给公网无防护访问。',
    createdDate: '2026-08-01'
  },
  {
    id: 'dsh-whip',
    name: 'dsh-whip',
    chineseName: '鞭策者 (Agent PUA 驱动器)',
    category: 'plugins',
    subCategory: 'experiment',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'zap',
    customColor: '#ff006e',
    description: '在 Agent 出现懈怠、循环思考或停滞时注入随机的激情鼓励和幽默催促。',
    longDescription: `【诞生背景】
在全自动长时间运行模式（full-auto / deep-auto）中，偶尔 Agent 会因为信心不足反复调用轻量检查工具而不敢推进实质编码。

【功能】
内置了一套充满幽默感的“赛博监工”语料库，在检测到空转超过设定周期后，以系统旁白形式注入积极干预（“咖啡已经泡好了，这个 bug 今晚必须拿下！”、“相信你的架构能力，直接开始重构吧！”），巧妙打破复读死循环。`,
    version: '1.0.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-whip',
    installCommand: 'cd ~/plugins/dsh-whip && pnpm link --global',
    tags: ['Fun', 'Experiment', 'Heartbeat', 'Prompt Hack'],
    highlights: ['打破死循环', '幽默诙谐', '自动化催进度'],
    tips: '适合在复杂的长链路自动化重构深夜任务开启。',
    createdDate: '2026-08-18'
  },
  {
    id: 'dsh-proactive',
    name: 'dsh-proactive',
    chineseName: '宿主级主动闹钟与心跳唤醒',
    category: 'plugins',
    subCategory: 'core',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'alarm-clock',
    customColor: '#e76f51',
    description: '提供精准 Cron 定时器、延时唤醒与静默免打扰机制，赋予 Agent 真正的时间自主意识。',
    longDescription: `【能力跃迁】
传统的 LLM Agent 只能由人类发送消息触发。有了 \`dsh-proactive\`，Agent 可以自主安排未来时间点：
- “明天早上 9:00 检查生产集群日志并生成简报”
- “每隔 30 分钟检查一次后台下载任务进度，完成后提醒我”
- “遇到夜间安静时间自动顺延，不消耗每日唤醒额度”

【特性】
支持单次延迟（after_seconds）、固定周期（every_seconds）、标准五段式 Cron 以及防风暴的统一随机扰动抖动（jitter_seconds）。`,
    version: '1.4.2',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-proactive',
    installCommand: 'dsh plugin install dsh-proactive',
    configExample: `proactive:
  enabled: true
  max_deliveries_per_day: 30
  quiet_hours:
    start: "23:00"
    end: "08:00"
    time_zone: "Asia/Shanghai"`,
    tags: ['Cron', 'Proactive', 'Autonomous', 'Scheduler'],
    docId: 'proactive-scheduler-design',
    highlights: ['自主定时调度', '静默唤醒与免打扰', 'Cron 与相对延时', '与 IM 无缝桥接'],
    tips: '搭配 dsh-im 插件使用，可在特定日程准时给你的飞书/微信推送日报！',
    createdDate: '2026-06-15'
  },
  {
    id: 'dsh-set-model',
    name: 'dsh-set-model',
    chineseName: '多模型动态路由调控',
    category: 'plugins',
    subCategory: 'tools',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'cpu',
    customColor: '#457b9d',
    description: '在会话中根据任务复杂度动态切换 Provider、Model 与思考深度（Reasoning Effort）。',
    longDescription: `【降本增效的利器】
一个完整的复杂工程任务包括：架构设计 -> 编码落地 -> 跑测试 -> 文档编写。
- 架构与排错：切换到 high / xhigh（深入推理模型）
- 常规编写与跑测试：切换到 medium / fast 便宜快速模型
- 写作与创意：切换到 writing 模式

通过动态路由，兼顾极致输出质量与开发响应速度，显著节省大模型 API 费用。`,
    version: '1.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-set-model',
    installCommand: 'dsh plugin install dsh-set-model',
    tags: ['Model Routing', 'Reasoning', 'Cost Optimization'],
    highlights: ['会话内平滑切模型', '动态调节思维链深度', '全流程能效比最优'],
    tips: '切忌在单轮对话内高频来回切换模型，因为切换会导致会话历史的 KV 缓存重算。',
    createdDate: '2026-07-10'
  },
  {
    id: 'dsh-mini-memory',
    name: 'dsh-mini-memory',
    chineseName: '轻量本地持久记忆',
    category: 'plugins',
    subCategory: 'experiment',
    rarity: 'silver',
    stackSize: 16,
    iconType: 'database',
    customColor: '#2a9d8f',
    description: '无需繁重向量数据库，基于纯 JSON/Markdown 的敏捷用户偏好与项目约定持久化。',
    longDescription: `针对小型设备（如手机 Termux）特别优化，避免起巨大的 Qdrant 或 Milvus。用极低资源开销实现跨 Session 的记忆注入与偏好维护。`,
    version: '0.2.1',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-mini-memory',
    installCommand: 'cd ~/plugins/dsh-mini-memory && pnpm link --global',
    tags: ['Memory', 'Low-Resource', 'Local-First'],
    highlights: ['零额外守护进程', '纯纯文本透明可见', '手机友好'],
    createdDate: '2026-08-25'
  },
  {
    id: 'dsh-simulated-life',
    name: 'dsh-simulated-life',
    chineseName: '虚拟生活每日演算系统',
    category: 'plugins',
    subCategory: 'workflow',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'compass',
    customColor: '#e9c46a',
    description: '模拟虚拟世界与 Living Agent 的每日生活事件、因果结算与命运投骰。',
    longDescription: `【赋予数字生命呼吸感】
结合真随机数与虚拟小镇设定，每天早晨为 Agent 演算周边环境事件（天气变化、邻居陈伯赠书、集市见闻）。Agent 通过 \`life_react\` 记录情感、思考与行动，因果会持久化到明天的世界状态中。`,
    version: '1.0.3',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-simulated-life',
    installCommand: 'dsh plugin install dsh-simulated-life',
    tags: ['Simulated Life', 'RPG', 'Emergence', 'Living Agent'],
    highlights: ['因果闭环演算', '真随机命运投掷', '真实情感持久化'],
    tips: '与星露谷物语的沉浸感不谋而合，是构建数字伴侣的绝佳底层。',
    createdDate: '2026-09-01'
  },
  {
    id: 'dsh-anti-addiction',
    name: 'dsh-anti-addiction',
    chineseName: '防沉迷护盾',
    category: 'plugins',
    subCategory: 'experiment',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'heart',
    customColor: '#e63946',
    description: '限制每日前台使用时长与深夜时段访问，守护健康作息的自律守护者。',
    longDescription: `【痛点】
AI Agent 全自动运行时，用户容易沉迷于持续监控与交互，深夜不舍得关掉，长期影响健康。

【核心机制】
- 按日累计前台使用时间，超过 maxDailyMinutes 后自动进入锁定冷却；
- 夜间 blockedStartHour ~ blockedEndHour 全局静默，Agent 不再响应非紧急请求；
- 空闲超过 idleThresholdMs 自动断开，heartbeatIntervalMs 心跳保活；
- unlockGraceMinutes 宽容期机制，防止误触锁定后无法紧急解锁。`,
    version: '0.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-anti-addiction',
    installCommand: 'cd ~/projects/dsh-anti-addiction && pnpm link --global',
    configExample: `anti-addiction:
  enabled: false
  maxDailyMinutes: 120
  blockedStartHour: 23
  blockedEndHour: 7`,
    tags: ['Health', 'Self-Control', 'Automation', 'Experiment'],
    highlights: ['日时长限额', '深夜静默', '心跳保活', '宽容期解锁'],
    tips: '默认关闭，建议在深夜长链路任务中启用，让 Agent 也能好好"睡觉"。',
    createdDate: '2026-09-10'
  },
  {
    id: 'dsh-mobile-qol',
    name: 'dsh-mobile-qol',
    chineseName: '移动端体验增强',
    category: 'plugins',
    subCategory: 'tools',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'smartphone',
    customColor: '#264653',
    description: '专为手机/平板触屏优化的 Web UI 增强套件：侧边栏滑动手势、输入法适配等。',
    longDescription: `【诞生背景】
DSH Web GUI 原本针对桌面端设计，在手机浏览器上存在触控目标过小、侧边栏难以展开、输入法弹起遮挡输入框等一系列体验痛点。

【特性】
- 侧边栏左滑手势呼出，右滑收回，无需精准点击汉堡菜单；
- 输入法弹出时自动滚动视口到输入框位置，防止遮挡；
- 触控目标自适应放大，符合 Material Design 48dp 最小命中区域；
- 长按消息体复制内容，减少移动端选词困难。`,
    version: '0.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-mobile-qol',
    installCommand: 'cd ~/projects/dsh-mobile-qol && pnpm link --global',
    tags: ['Mobile', 'UX', 'Touch', 'Web UI'],
    highlights: ['侧滑手势呼出侧栏', '输入法防遮挡', '触控目标放大', '长按复制'],
    tips: '在 Termux 浏览器或 iPad Safari 上使用 DSH 时必备，体验从"能用"变"好用"。',
    createdDate: '2026-09-08'
  },
  {
    id: 'dsh-message-datetime',
    name: 'dsh-message-datetime',
    chineseName: '每轮时钟注入',
    category: 'plugins',
    subCategory: 'core',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'calendar',
    customColor: '#e63946',
    description: '在每轮对话的 Runtime Context 中注入一行精确的当前日期时间与时区。',
    longDescription: `【为什么需要】
LLM 默认不知道"现在几点"。在涉及定时任务、日志排查、"明天发提醒"等场景时，Agent 经常给出错误的时间判断。

【机制】
- 每轮请求前，向 Runtime Context 注入格式化时间戳：\`[Current time: Wed 2026-09-16 19:38:09 +08:00 (Asia/Shanghai)]\`；
- 自动感知系统时区，无需手动配置；
- 极低开销：仅一行文本注入，不消耗额外 token 配额。`,
    version: '0.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-message-datetime',
    installCommand: 'cd ~/projects/dsh-message-datetime && pnpm link --global',
    tags: ['Time', 'Context', 'Core', 'Low-Overhead'],
    highlights: ['每轮自动注入', '时区自适应', '极低 token 开销', '定时任务基石'],
    tips: '与 dsh-proactive 配合使用，Agent 才能正确判断"再过 2 小时"是几点。',
    createdDate: '2026-09-05'
  },
  {
    id: 'dsh-hybrid-notify',
    name: 'dsh-hybrid-notify',
    chineseName: '多通道混合通知',
    category: 'plugins',
    subCategory: 'tools',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'bell',
    customColor: '#f4a261',
    description: '多通道通知插件：页面 Toast 提醒、PWA 系统推送通知与自定义提示音三合一。',
    longDescription: `【痛点】
Agent 在后台长任务完成、遇到错误或需要用户介入时，如果没有主动通知机制，用户只能不断切回页面查看。

【三通道融合】
1. In-page Toast：页面内的浮动通知气泡，支持点击跳转到对应消息；
2. PWA Push：浏览器系统级推送通知，即使页面在后台或最小化也能收到；
3. Sound：可自定义的 8-bit 提示音，区分消息/完成/错误三种事件类型。

【与 proactive 配合】
dsh-proactive 的 cron 唤醒结果可通过本插件的三通道之一送达用户。`,
    version: '0.1.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-hybrid-notify',
    installCommand: 'cd ~/projects/dsh-notify && pnpm link --global',
    tags: ['Notification', 'Toast', 'PWA', 'Sound'],
    highlights: ['三通道融合', 'PWA 系统推送', '自定义提示音', '点击跳转消息'],
    tips: '在手机上开启 PWA 通知权限，长任务完成后手机会震动提醒，再不用盯着看了！',
    createdDate: '2026-08-28'
  },
  {
    id: 'dsh-im-humanize',
    name: 'dsh-im-humanize',
    chineseName: '九合一 IM 即时消息桥接',
    category: 'plugins',
    subCategory: 'core',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'chat-bubble',
    customColor: '#3a86ff',
    description: '将九种 IM 机器人（微信/QQ/Telegram/飞书/Discord/Slack 等）接入 DSH，实现全平台消息收发。',
    longDescription: `【能力全景】
一个插件桥接九大主流 IM 平台：微信（企业微信/个人微信）、QQ、Telegram、飞书/Lark、DingTalk、Slack、Discord、WhatsApp。

【核心特性】
1. 多 Bot 管理：每个平台支持多个 Bot 实例，统一配置面板；
2. 消息人性化渲染：将 Agent 的 Markdown 输出转换为各平台原生格式（Telegram HTML、飞书卡片消息等）；
3. 双向通信：IM 消息自动转发给 Agent，Agent 回复自动推送到 IM；
4. 会话隔离：不同 IM 来源的会话独立追踪，互不干扰；
5. AI Office 集成：将 IM 消息桥接到公网 AI Office 入口。`,
    version: '4.13.0',
    author: 'John Ren',
    repoUrl: 'https://github.com/johnren/dsh-im-humanize',
    installCommand: 'cd ~/projects/dsh-im-humanize && pnpm link --global',
    configExample: `dsh-im:
  platforms:
    telegram:
      bots:
        - botId: "telegram_xxx"
          tokenRef: "DSH_TELEGRAM_BOT_TOKEN"
    weixin:
      accounts: []`,
    tags: ['IM', 'Telegram', 'WeChat', 'Feishu', 'Core', 'Must-Have'],
    highlights: ['九平台全覆盖', '消息人性化渲染', '双向通信', '多 Bot 管理'],
    tips: '与 dsh-proactive 组合，Agent 可以在每天早上通过 Telegram 给你推送昨日工作简报！',
    createdDate: '2026-08-15'
  }
];

export const SKILLS_DATA: InventoryItem[] = [
  {
    id: 'skill-container-ops',
    name: 'container-ops',
    chineseName: '容器环境运维与避坑规范',
    category: 'skills',
    subCategory: 'ops',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'terminal',
    customColor: '#e63946',
    description: '红米 K30S Ultra 容器启动链、canonical 挂载树、服务规范及 /dev /proc /sys 铁律。',
    longDescription: `【极其珍贵的一手嵌入式/容器排坑结晶】
详细记载了在 Android Termux + chroot-distro Ubuntu 24.04（真实 root、无 systemd、PID 1 为 Android init）环境下的完整运维手册：
1. 启动链与真实 mount 命名空间；
2. Devfs 安全铁律：绝对禁止往 rootfs /dev /proc /sys 里 mknod 或裸写文件；
3. /dev/shm 内存盘重建与 multiprocessing 跨进程通信支持；
4. Supervisord 服务快捷管理命令（sv status, sv restart, svlog）；
5. 8GB 物理内存下的高危进程 OOM 护栏与 Swap 调优策略。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/container-ops <your-agent-dir>/',
    tags: ['Termux', 'Chroot', 'Linux Ops', 'Kernel', 'Must-Read'],
    docId: 'container-devfs-rules',
    highlights: ['真机实测踩坑', '避免系统级崩溃', 'Devfs 铁律详解', 'Supervisor 服务全家桶'],
    tips: '在 Android 容器环境开发，不看这篇文档早晚会把设备挂载树写穿！',
    createdDate: '2026-05-10'
  },
  {
    id: 'skill-workflow-implement-review',
    name: 'workflow-implement-review',
    chineseName: '交付铁三角工作流',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#2a9d8f',
    description: '规范化的 6 步交付流水线：实施 -> 静态/单元测试 -> 独立审查 -> 验收 -> 总结 -> 提交。',
    longDescription: `【打造高质量工程的核心流程】
1. Implement: 严格按 Plan 编码，注重可读性与健壮性；
2. Test: 编译检查、运行测试用例，杜绝半成品；
3. Review: 召集独立的 reviewer 子代理进行代码严审，不达到准入标准坚决不交付；
4. Validate: 撰写明确的用户验收指导；
5. Documentation: 沉淀 Summary 与 Pitfall；
6. Commit: 遵循原子化提交原则。`,
    author: 'John Ren',
    installCommand: 'dsh skill install workflow-implement-review',
    tags: ['Best Practice', 'Workflow', 'Code Quality', 'Review'],
    highlights: ['独立 Reviewer 把关', '闭环验证', '标准化产出'],
    tips: '这是任何负责任的 AI Agent 走向专业生产级软件开发必须装备的核心技能。',
    createdDate: '2026-06-01'
  },
  {
    id: 'skill-dev-dsh-plugin',
    name: 'dev-dsh-plugin',
    chineseName: 'DSH 插件开发指南',
    category: 'skills',
    subCategory: 'ai-core',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'puzzle',
    customColor: '#8338ec',
    description: 'Cordis 架构插件开发全攻略：依赖链接陷阱、服务注入协议与 Web Client 热重载规范。',
    longDescription: `【避坑重点】
1. pnpm link 依赖缺失陷阱：link 包的依赖必须显式声明并本地安装，否则 DSH 启动 ESM 解析失败直接整机 STOPPED！
2. ctx.inject 强校验：访问未在 inject 数组声明的 ctx 服务直接报错；
3. Web Client Bundle 构建：构建产物缺少会导致 Web 端 bootstrap facade missing。`,
    author: 'John Ren',
    tags: ['Cordis', 'Plugin API', 'Architecture'],
    docId: 'dsh-plugin-pitfalls',
    highlights: ['Cordis 机制透视', '避免死锁与启动失败', 'Client HMR 打包技巧'],
    createdDate: '2026-07-05'
  },
  {
    id: 'skill-camoufox-cli',
    name: 'camoufox-cli',
    chineseName: '指纹伪装反反爬自动化',
    category: 'skills',
    subCategory: 'ops',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'globe',
    customColor: '#fb5607',
    description: '基于 Camoufox 浏览器的反指纹爬虫与 Web 自动化，轻松绕过 Cloudflare 验证。',
    longDescription: `解决传统 Playwright / Puppeteer 瞬间被 Cloudflare Turnstile、DataDome 盾拦截的死穴。针对 ARM64 Linux 容器编译优化，支持一键起 session、无头/有头切换与 DOM 结构提取。`,
    author: 'John Ren',
    tags: ['Anti-Detect', 'Browser', 'Scraping', 'Bypass'],
    highlights: ['过盾能力强', 'ARM64 兼容', 'Agent 友好接口'],
    createdDate: '2026-08-10'
  },
  {
    id: 'skill-code-deep-dive',
    name: 'code-deep-dive',
    chineseName: 'Vibe Coding 碎片化深度学习篇',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'book-open',
    customColor: '#ffb703',
    description: '为快速原型项目生成 1.5 小时深度解析长文，利用碎片时间把代码原理彻底学透。',
    longDescription: `专为移动端（手机通勤、午休、睡前）阅读优化的单篇万字深度教程生成规范。代码完整内嵌、原理追根溯源，彻底消除 Vibe Coding 带来的“代码跑得通但我不知道为什么”的知识恐慌。`,
    author: 'John Ren',
    tags: ['Learning', 'Deep Dive', 'Education', 'Mobile Friendly'],
    highlights: ['1.5h 自包含长文', '手机排版极佳', '带交互测验与架构图'],
    createdDate: '2026-08-20'
  },
  {
    id: 'skill-seedream-imagegen',
    name: 'seedream-imagegen',
    chineseName: 'Doubao 旗舰生图接入',
    category: 'skills',
    subCategory: 'multimodal',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'palette',
    customColor: '#3a86ff',
    description: '通过网关调用 doubao-seedream-5.0-lite 模型，实现高清角色头像与场景概念生图。',
    longDescription: `规范了最小像素限制（3686400）、生图提示词架构范式、自动下载与 IM 附件回传流水线，为 Agent 提供视觉形象塑造能力。`,
    author: 'John Ren',
    tags: ['ImageGen', 'AI Art', 'Multimodal'],
    highlights: ['高保真画风', '参数防呆校验', 'IM 自动交付'],
    createdDate: '2026-09-05'
  },
  {
    id: 'skill-bad-smell',
    name: 'bad-smell',
    chineseName: '代码异味感知雷达',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'flame',
    customColor: '#ef4444',
    description: '当 Agent 觉得代码难于理解、设计混乱或不易维护时主动触发，进行代码质量自审。',
    longDescription: `【嗅觉训练】
好代码不仅要跑得通，更要读得懂。本技能让 Agent 在编码过程中主动感知"坏味道"：
- 过长函数、过深嵌套、过多参数；
- 重复代码、魔法数字、命名歧义；
- 上帝类、特性依恋、散弹式修改。

感知到异味后，Agent 会主动建议重构方案并解释理由，而不是闷头写完就交。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/bad-smell <your-agent-dir>/',
    tags: ['Code Quality', 'Refactoring', 'Self-Review'],
    highlights: ['主动感知坏味道', '重构建议', '设计原则内化'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-chroot-devfs-pitfall',
    name: 'chroot-devfs-pitfall',
    chineseName: 'Devfs 安全铁律索引',
    category: 'skills',
    subCategory: 'ops',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'terminal',
    customColor: '#e63946',
    description: '容器 rootfs /dev /proc /sys 安全规范的故障排查入口与索引技能。',
    longDescription: `【触发条件】
当出现以下症状时自动触发本技能索引：
- 写 /dev/null 失败、/proc/self/fd/N 打不开；
- git/apt 报 urandom/null EACCES 错误；
- multiprocessing/sem_open 裸 ENOENT（/dev/shm 缺失）；
- os.ttyname 报 Inappropriate ioctl（devpts 挂载异常）；
- browser_install 报 'python' ENOENT。

本技能只做触发与索引，故障细节、命令与完整逻辑一律见 container-ops 技能。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/chroot-devfs-pitfall <your-agent-dir>/',
    tags: ['Devfs', 'Chroot', 'SELinux', 'Troubleshooting'],
    highlights: ['症状速查', '自动索引', '防止毁灭性误操作'],
    tips: '在容器环境写脚本前必读，一个 echo > /dev/null 就能让系统挂掉！',
    createdDate: '2026-08-31'
  },
  {
    id: 'skill-coding',
    name: 'coding',
    chineseName: '编码开发核心规范',
    category: 'skills',
    subCategory: 'ai-core',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'puzzle',
    customColor: '#8338ec',
    description: '在本机进行任何编程或软件开发前必须立刻读取并严格遵循的核心规范。',
    longDescription: `【三大原则】
1. 降低认知负荷：代码不需要注释就能读懂；单一职责；及时拆分。
2. 童子军法则：离开时比来时更干净；随手重构；不轻易 hack。
3. 实用主义：简单直接；项目由独立开发者管理；不过度防御。

【文档规范】
极简文档策略：AGENTS.md 项目指引、模块级 AGENTS.md、需求/问题/参考文档分目录管理。

【多 Agent 协作】
总是假定有其他 Agent 在同时工作，不处理改动范围之外的变化。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/coding <your-agent-dir>/',
    tags: ['Coding', 'Best Practice', 'Core', 'Must-Read'],
    highlights: ['三大核心原则', '极简文档策略', '多 Agent 协作'],
    tips: '这是所有编码任务的入口技能，写第一行代码前必读！',
    createdDate: '2026-08-20'
  },
  {
    id: 'skill-commit-own-changes',
    name: 'commit-own-changes',
    chineseName: '安全原子提交术',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'shield-check',
    customColor: '#2a9d8f',
    description: '基于 git-hunk 提交改动，防止带入其他无关的未提交修改，事关安全。',
    longDescription: `【为什么需要】
在多 Agent 同时工作的环境中，\`git add .\` 会把其他 Agent 的改动一起提交，造成混乱。

【核心规则】
- 执行任何 \`git add\` 或 \`git commit\` 前必须使用本技能；
- 基于 git diff 逐 hunk 选择性添加，只提交属于当前任务的改动；
- 例外：若当前在单独 worktree 中工作，则无需使用本技能。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/commit-own-changes <your-agent-dir>/',
    tags: ['Git', 'Commit', 'Safety', 'Multi-Agent'],
    highlights: ['hunk 级精准提交', '防止误提交他人改动', '多 Agent 安全'],
    tips: '多 Agent 并行工作时，没有这个技能就是定时炸弹！',
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-create-simulated-events',
    name: 'create-simulated-events',
    chineseName: '虚拟世界事件演算',
    category: 'skills',
    subCategory: 'workflow',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'compass',
    customColor: '#e9c46a',
    description: '模拟与演化虚拟世界、环境及 Living Agent 的每日生活事件，执行因果与反应结算。',
    longDescription: `【世界引擎】
每日为虚拟世界演算周边环境事件：天气变化、邻居互动、集市见闻、意外惊喜。
使用系统真随机数投掷命运骰子，确保每天的事件流不可预测。

【因果闭环】
Agent 通过 \`life_react\` 记录对事件的情感、思考与行动反应，
这些反应会持久化到明天的世界状态中，形成真实的因果链条。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/create-simulated-events <your-agent-dir>/',
    tags: ['Simulation', 'RPG', 'Living Agent', 'Emergence'],
    highlights: ['真随机命运投骰', '因果持久化', '每日事件演算'],
    createdDate: '2026-09-15'
  },
  {
    id: 'skill-cross-check',
    name: 'cross-check',
    chineseName: '批判性子代理审查',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'search',
    customColor: '#7209b7',
    description: '使用子代理对当前的想法、结论、计划或决策进行批判性检查和核实。',
    longDescription: `【触发时机】
- 对计划感到不踏实时；
- 感觉某个结论"可能有问题但说不清"时；
- 决策证据不充足时；
- 决策判断失误代价高、希望二次确保准确性时。

【机制】
拉起一个独立的子代理，将当前结论/计划/决策完整传递，
要求其从反面立场进行批判性分析，寻找漏洞和反例，
输出"确认通过"或"发现以下问题"的明确判断。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/cross-check <your-agent-dir>/',
    tags: ['Verification', 'Critical Thinking', 'Subagent', 'Safety'],
    highlights: ['独立子代理审查', '反面立场批判', '防止确认偏误'],
    tips: '架构决策和高风险方案设计后务必 cross-check 一次！',
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-deep-auto',
    name: 'deep-auto',
    chineseName: '深度自动模式',
    category: 'skills',
    subCategory: 'workflow',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'cpu',
    customColor: '#457b9d',
    description: 'deep auto 模式：Agent 在极深层级自主运行，适合超长链路复杂工程。',
    longDescription: `【与 full-auto 的区别】
full-auto 替代所有用户交互，而 deep-auto 进一步提升推理深度：
- 自动启用更深层的 reasoning effort；
- 适合需要数十步连续推理、多子代理协作的复杂工程；
- 在不确定时自动拉起 cross-check 和 deep-researcher。

适用于夜间无人值守的大型重构或复杂调研任务。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/deep-auto <your-agent-dir>/',
    tags: ['Automation', 'Deep Reasoning', 'Unattended'],
    highlights: ['极深推理深度', '自动拉起子代理', '无人值守'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-delay-validation',
    name: 'delay-validation',
    chineseName: '延迟验证模式',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#fbbf24',
    description: '原本需要用户确认的步骤由模型自行判断并记录待验证项，用户事后审阅。',
    longDescription: `【设计理念】
在全自动流程中，频繁的用户确认是最大瓶颈。本模式将确认推迟到事后：

1. 高风险项仍然暂停等待用户；
2. 低风险项由模型采取最佳判断后继续推进；
3. 所有决策与待确认项记录到指定文档；
4. 用户事后审阅文档，一次性确认或修正。

可选 stopBefore 参数指定自动推进的截止阶段。计划将来替换 full-auto。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/delay-validation <your-agent-dir>/',
    tags: ['Automation', 'Validation', 'Workflow', 'Future'],
    highlights: ['事后审阅代替实时中断', '高风险项仍暂停', '决策留痕'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-dev-tunnel',
    name: 'dev-tunnel',
    chineseName: '临时 Cloudflare 隧道',
    category: 'skills',
    subCategory: 'ops',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'globe',
    customColor: '#4361ee',
    description: '一行命令给本地开发服务器开临时 Cloudflare 隧道（免登录 quick tunnel）。',
    longDescription: `【用途】
- 给用户展示本地 dev/preview 站点；
- 外部回调（webhook）调试；
- 手机真机访问本地服务。

【实现】
使用 cloudflared quick tunnel（trycloudflare.com），免登录即用即走。

【本机坑】
本机有系统级 cloudflared 配置会静默覆盖 --url 参数，
导致隧道指向错误的后端。本技能含绕开方法与症状速查。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/dev-tunnel <your-agent-dir>/',
    tags: ['Cloudflare', 'Tunnel', 'DevOps', 'Quick'],
    highlights: ['一行命令开隧道', '免登录即用', '含本机坑绕开'],
    tips: '隧道地址是临时的，重启就变。要持久暴露用 named-cf-tunnel 技能！',
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-full-auto',
    name: 'full-auto',
    chineseName: '全自动模式',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'cpu',
    customColor: '#06d6a0',
    description: '所有需要向用户提问、决策、授权的地方，替换为询问 auto_human 子代理。',
    longDescription: `【全自动哲学】
将所有需要用户判断的决策点（方案选择、参数确认、风险授权）交给一个扮演人类用户的 auto_human 子代理。

【适用场景】
- 夜间无人值守的批量工程；
- 用户信任 Agent 判断力的快速迭代；
- 多步骤流水线式开发。

【局限】
auto_human 子代理的判断力仍受模型限制，极高风险操作建议用 delay-validation 模式。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/full-auto <your-agent-dir>/',
    tags: ['Automation', 'Auto-Human', 'Unattended'],
    highlights: ['决策全自动', 'auto_human 代理', '流水线开发'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-gemini-imagegen',
    name: 'gemini-imagegen',
    chineseName: 'Gemini 旗舰生图',
    category: 'skills',
    subCategory: 'multimodal',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'palette',
    customColor: '#3a86ff',
    description: '基于 cpa 网关的 gemini-3.1-flash-image 模生图，走 chat/completions 流式接口。',
    longDescription: `【接口规范】
- 走 cpa 网关的 OpenAI 兼容 chat/completions 接口；
- 图片以 base64 JPEG 在 delta.images 返回；
- 含流式解析脚本，自动提取图片并保存。

【与 seedream 的区别】
Gemini 生图风格偏真实照片质感，seedream 更偏插画/动漫风格。
两者互补，可根据场景选用。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/gemini-imagegen <your-agent-dir>/',
    tags: ['ImageGen', 'Gemini', 'Multimodal', 'CPA'],
    highlights: ['流式接口生图', 'base64 自动解析', '真实照片质感'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-grilling',
    name: 'grilling',
    chineseName: '刨根问底追问术',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'flame',
    customColor: '#ff006e',
    description: '围绕计划对用户进行刨根问底的追问，厘清计划的疑点和模糊地带。',
    longDescription: `【场景】
当用户给出一个模糊的需求或计划，直接开始做大概率会跑偏。
本技能让 Agent 围绕计划的核心疑点，系统性地质问用户：
- 目标优先级？
- 边界在哪里？
- 什么算成功？什么算失败？
- 有哪些隐性约束？

直到所有疑点都被消除，才进入实施阶段。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/grilling <your-agent-dir>/',
    tags: ['Planning', 'Questioning', 'Requirements'],
    highlights: ['系统性追问', '消除模糊地带', '防止跑偏'],
    tips: '用户说"随便做"或需求只有一句话时，先 grill 一轮！',
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-handoff',
    name: 'handoff',
    chineseName: '交接文档生成',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'book-open',
    customColor: '#f4a261',
    description: '编写交接文档，将工作上下文传递给另一个 agent、同事、检视者或 oncall。',
    longDescription: `【功能】
生成结构化的交接文档，包含：
- 当前任务进度与状态；
- 已完成的工作与未完成的待办；
- 关键决策与原因；
- 环境信息与注意事项；
- 下一步行动建议。

可选参数指定目标受众（如 "to reviewer"、"给 QA"、"for oncall"），
文档措辞会据此调整技术深度。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/handoff <your-agent-dir>/',
    tags: ['Handoff', 'Documentation', 'Collaboration'],
    highlights: ['结构化交接', '受众适配', '上下文无损传递'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-named-cf-tunnel',
    name: 'named-cf-tunnel',
    chineseName: '永久命名隧道',
    category: 'skills',
    subCategory: 'ops',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'shield-check',
    customColor: '#06d6a0',
    description: '将本机某个端口以固定自定义域名（*.<your-domain>）永久暴露到公网。',
    longDescription: `【与临时隧道的区别】
- 域名固定不变，重启不变；
- 通过系统 Named Tunnel 实现，走 Cloudflare Edge CDN；
- 可配合 Cloudflare Access 规则阻拦恶意扫描；
- 适合持久部署站点、新增服务入口。

【前置条件】
需要已配置的 Cloudflare Named Tunnel（cloudflared 守护进程）和自持域名。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/named-cf-tunnel <your-agent-dir>/',
    tags: ['Cloudflare', 'Tunnel', 'Domain', 'DevOps'],
    highlights: ['域名固定不变', 'CDN 加速', '配合 Access 防护'],
    tips: '新增持久服务时用这个，临时演示用 dev-tunnel。',
    createdDate: '2026-09-15'
  },
  {
    id: 'skill-officecli',
    name: 'officecli',
    chineseName: 'Office 文档 CLI 工具',
    category: 'skills',
    subCategory: 'office',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'scroll',
    customColor: '#4361ee',
    description: '使用 officecli CLI 工具创建、分析、校对和修改 Office 文档（.docx/.xlsx/.pptx）。',
    longDescription: `【能力】
- 创建 .docx/.xlsx/.pptx 文档；
- 检查格式问题、查找内容问题；
- 添加图表和数据可视化；
- 校对与修改已有文档。

通过命令行操作 Office 文档，无需安装桌面 Office 套件，
特别适合在 Termux/容器环境中由 Agent 驱动自动化文档生成。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/officecli <your-agent-dir>/',
    tags: ['Office', 'CLI', 'Document', 'Automation'],
    highlights: ['三格式全覆盖', '无需桌面套件', 'Agent 友好接口'],
    createdDate: '2026-08-20'
  },
  {
    id: 'skill-restart-dsh',
    name: 'restart-dsh',
    chineseName: '安全重启 DSH',
    category: 'skills',
    subCategory: 'ops',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'zap',
    customColor: '#e76f51',
    description: '安全重启 dsh 服务——Agent 跑在 dsh 内部，直接 restart 会杀掉自己。',
    longDescription: `【核心难题】
Agent 的进程本身运行在 DSH 内部。直接 \`supervisorctl restart dsh\` 会杀掉 Agent 连同 bash 命令一起终止。

【安全方案】
1. 用 setsid 延迟 detach 重启，让自己先脱钩；
2. 重启前必须先在单独端口验证 DSH 能稳定运行；
3. 验证通过才重启线上实例；
4. 重启线上实例前必须先征求用户书面同意。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/restart-dsh <your-agent-dir>/',
    tags: ['DSH', 'Restart', 'Safety', 'Ops'],
    highlights: ['自杀式重启安全方案', '验证先行', '用户书面同意'],
    tips: '修改了 cordis.patch.yml 后需要重启 DSH 生效，务必用这个技能！',
    createdDate: '2026-09-15'
  },
  {
    id: 'skill-spawn-deep-researcher',
    name: 'spawn-deep-researcher',
    chineseName: '深度调研子代理调度',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'search',
    customColor: '#4361ee',
    description: '使用 deep-researcher 子代理对特定主题进行深度、广泛、准确的网络调研。',
    longDescription: `【使用时机】
当需要对特定主题进行高质量调研时优先使用本技能，
而不是让主 Agent 自己进行零散搜索。

【流程】
1. 阅读本技能了解调度规范；
2. 拉起 deep-researcher 子代理；
3. 传递调研主题、深度要求和输出格式；
4. 子代理返回全面、准确、包含来源的调研报告。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/spawn-deep-researcher <your-agent-dir>/',
    tags: ['Research', 'Subagent', 'Web Search', 'Report'],
    highlights: ['独立子代理深度调研', '来源可靠', '结构化报告'],
    tips: '拉起 deep-researcher 前必须先阅读本技能！',
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-spawn-reviewer',
    name: 'spawn-reviewer',
    chineseName: '代码审查子代理调度',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#2a9d8f',
    description: '使用 reviewer 子代理进行高质量的代码审查，拉起前必须阅读本技能。',
    longDescription: `【审查标准】
reviewer 子代理从设计、实现、用户体验多方面进行审查，输出：
- 阻塞问题（P0/P1）；
- 建议改进（P2）；
- 非阻塞问题（P3）；
- 准入结论（通过/不通过）。

【准入门槛】
不达到准入标准坚决不交付。这是 workflow-implement-review 铁三角的审查环节基石。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/spawn-reviewer <your-agent-dir>/',
    tags: ['Code Review', 'Subagent', 'Quality', 'Gate'],
    highlights: ['多维度审查', '问题分级', '准入结论'],
    tips: '拉起 reviewer 前必须先阅读本技能了解审查范围与输出格式！',
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-teach-me',
    name: 'teach-me',
    chineseName: '技术深度长文生成',
    category: 'skills',
    subCategory: 'office',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'book-open',
    customColor: '#ffb703',
    description: '围绕当前需求、设计或问题，为独立开发者写一篇技术深度长文。',
    longDescription: `【与 code-deep-dive 的区别】
code-deep-dive 为 vibe coding 项目生成学习长文（偏补课性质）；
teach-me 则围绕当前正在做的需求/设计/问题，把核心设计、关键路径、实现细节讲透。

【输出规范】
- 附原始代码节选与 \`路径:行号\` 链接；
- 面向独立开发者（懂技术但可能不熟悉这个特定领域）；
- 可选参数指定要学习的主题。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/teach-me <your-agent-dir>/',
    tags: ['Learning', 'Documentation', 'Deep Dive', 'Teaching'],
    highlights: ['围绕当前需求', '代码节选带行号', '面向独立开发者'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-tidy',
    name: 'tidy',
    chineseName: '冗余修改清理',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'normal',
    stackSize: 1,
    iconType: 'sparkles',
    customColor: '#90e0ef',
    description: '清理无用/冗余的修改，保持工作区干净。',
    longDescription: `【场景】
在多轮迭代开发中，Agent 可能留下：
- 废弃的注释代码；
- 临时调试用的 console.log/print；
- 不再使用的导入语句；
- 半完成然后放弃的函数桩。

本技能让 Agent 主动扫描并清理这些垃圾，保持代码库整洁。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/tidy <your-agent-dir>/',
    tags: ['Cleanup', 'Code Quality', 'Hygiene'],
    highlights: ['主动清理垃圾', '保持工作区整洁', '童子军法则'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-try',
    name: 'try',
    chineseName: '可回退文件备份',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'database',
    customColor: '#2a9d8f',
    description: '为目标文件创建可回退的备份，在对文件做不确定的破坏性修改前必须使用。',
    longDescription: `【核心理念】
不确定的修改，先备份再动手。

【机制】
- 为目标文件创建带时间戳的备份副本；
- 修改后如果效果不对，可以一键回退到备份版本；
- 备份文件放在固定位置，便于管理。

【触发条件】
- 要对特定文件做不确定的破坏性修改时；
- 用户希望可以轻松回退时。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/try <your-agent-dir>/',
    tags: ['Backup', 'Safety', 'Rollback', 'File'],
    highlights: ['一键回退', '时间戳备份', '破坏性修改前置'],
    tips: '不确定的改动先 try 一下，比 git stash 更精准！',
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-unstuck',
    name: 'unstuck',
    chineseName: '脱困退一步分析',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'sparkles',
    customColor: '#ff6000',
    description: '对同一问题连续修改两次都未达预期时，立刻暂停并退一步重新分析。',
    longDescription: `【反模式】
继续试错只会引入更多不确定性。当连续两次修改都没达到预期效果时，
说明 Agent 对问题的理解有误，继续在同一方向上发力只是浪费资源。

【正确做法】
1. 立刻暂停手上的工作；
2. 使用本技能；
3. 退一步重新分析问题根因；
4. 考虑是否需要换个方向或拉起 deep-researcher 调研。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/unstuck <your-agent-dir>/',
    tags: ['Troubleshooting', 'Mindset', 'Anti-Pattern', 'Safety'],
    highlights: ['两次失败即停', '退一步重分析', '防止越改越乱'],
    tips: '两次修改没修好？停下！不是你不努力，是方向有问题。',
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-update-ive-learned',
    name: 'update-ive-learned',
    chineseName: 'What I\'ve Learned 站点更新',
    category: 'skills',
    subCategory: 'office',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'scroll',
    customColor: '#52b788',
    description: '更新 What I\'ve Learned 个人学习记录站：新增条目、backlog 晋升、发布到 GitHub Pages。',
    longDescription: `【站点功能】
个人学习记录站，记录已学知识和想学清单。

【操作类型】
- 新增 learned 条目（已学过的东西）；
- 新增 backlog 条目（想学的东西）；
- backlog 晋升为 learned（学完了）；
- 发布更新到 GitHub Pages。

本技能只讲更新方法，不含写作风格建议。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/update-ive-learned <your-agent-dir>/',
    tags: ['Learning', 'GitHub Pages', 'Personal', 'Site'],
    highlights: ['条目增删改', 'backlog 晋升', '一键发布'],
    createdDate: '2026-09-15'
  },
  {
    id: 'skill-update-module-instruction',
    name: 'update-module-instruction',
    chineseName: '模块级 AGENTS.md 规范',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'normal',
    stackSize: 1,
    iconType: 'book-open',
    customColor: '#f4a261',
    description: '模块/子模块级 AGENTS.md 更新规范，记录对该模块后续开发有明确收益的经验。',
    longDescription: `【触发时机】
- 新建目录时；
- 新需求开发结束时；
- 重构结束时；
- 记录对该模块后续开发有明确收益的经验时。

【原则】
只记录对后续开发有明确收益的信息，不记流水账。
内容包括：模块职责、关键约束、常见陷阱、测试命令。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/update-module-instruction <your-agent-dir>/',
    tags: ['AGENTS.md', 'Module', 'Documentation', 'Convention'],
    highlights: ['模块级指引', '经验沉淀', '非流水账'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-update-project-instruction',
    name: 'update-project-instruction',
    chineseName: '项目级 AGENTS.md 规范',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'normal',
    stackSize: 1,
    iconType: 'book-open',
    customColor: '#e76f51',
    description: '项目级 AGENTS.md 更新规范，更新必须了解的工作流程、测调命令、开发规范。',
    longDescription: `【触发时机】
- 新建项目时；
- 新建或重构模块时；
- 更新必须了解的工作流程、测调命令、开发规范时。

【与模块级的区别】
项目级 AGENTS.md 是整个项目的入口指引，
包含：项目目标、目录地图、开发与调试命令、全局规范。
模块级是具体子目录的局部指引。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/update-project-instruction <your-agent-dir>/',
    tags: ['AGENTS.md', 'Project', 'Documentation', 'Convention'],
    highlights: ['项目入口指引', '目录地图', '全局规范'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-update-references',
    name: 'update-references',
    chineseName: '通用参考文档规范',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'normal',
    stackSize: 1,
    iconType: 'book-open',
    customColor: '#916132',
    description: 'project_root/references 目录的更新规范，用于不隶属于特定功能的通用规范。',
    longDescription: `【用途】
当需要更新不隶属于特定功能的通用规范时使用。
如：代码提交规范、测试用例规范、文档规范、版本管理等。

【与 docs/references 的区别】
references/ 存放的是"规则"（该怎么做），
docs/references/ 存放的是"参考"（可以怎么查）。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/update-references <your-agent-dir>/',
    tags: ['References', 'Convention', 'Documentation'],
    highlights: ['通用规范维护', '不隶属特定功能', '规则而非参考'],
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-update-validation-requirements',
    name: 'update-validation-requirements',
    chineseName: '用户验收要求文档',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'normal',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#2a9d8f',
    description: '创建或更新需求、问题的用户验证要求文档，尤其需要真实设备/环境验证时使用。',
    longDescription: `【场景】
实施内容需要用户验收时，尤其需要：
- 真实设备验证（如手机端体验）；
- 真实环境验证（如公网隧道连通性）；
- 真实交互验证（如 IM 消息收发）。

生成文档明确列出：
- 需要验证的场景清单；
- 预期结果；
- 实际操作步骤；
- 回归测试要点。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/update-validation-requirements <your-agent-dir>/',
    tags: ['Validation', 'User Acceptance', 'Testing', 'Document'],
    highlights: ['场景清单化', '操作步骤明确', '回归测试要点'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-update-yaagb',
    name: 'update-yaagb',
    chineseName: 'AI 自生成博客更新',
    category: 'skills',
    subCategory: 'office',
    rarity: 'silver',
    stackSize: 1,
    iconType: 'scroll',
    customColor: '#f72585',
    description: '更新 yet-another-ai-generated-blog（AI 自生成博客），涉及该博客任何更新时使用。',
    longDescription: `【操作范围】
- 新增/修改文章；
- 改站点配置；
- 发布到 GitHub Pages。

【站点性质】
yet-another-ai-generated-blog 是一个由 AI 自主生成内容的博客站点，
文章内容由 Agent 撰写，站点配置和发布流程由本技能规范。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/update-yaagb <your-agent-dir>/',
    tags: ['Blog', 'GitHub Pages', 'Content', 'Site'],
    highlights: ['文章增改', '站点配置', '一键发布'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-web-search-best-practice',
    name: 'web-search-best-practice',
    chineseName: '网络搜索方法论',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'search',
    customColor: '#4361ee',
    description: '网络搜索的方法论和最佳实践，进行网络搜索前必须使用本技能。',
    longDescription: `【核心理念】
充分的搜索和调研能帮助避免误区、了解 best practice 和事实基准。

【方法论】
1. 先搜索再行动：任何与外部事实相关的活动和任何疑虑，先搜索到 95%+ 把握才继续；
2. 简单搜索在父会话进行；
3. 对特定主题的深入调研使用 spawn-deep-researcher 子代理；
4. 搜索后用 web_fetch 获取全文内容；
5. 引用来源 URL 作为 markdown 链接。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/web-search-best-practice <your-agent-dir>/',
    tags: ['Search', 'Methodology', 'Best Practice', 'Must-Read'],
    highlights: ['搜索先行', '95% 把握阈值', '父会话 vs 子代理'],
    tips: '进行任何网络搜索前必须先读这个技能！',
    createdDate: '2026-08-26'
  },
  {
    id: 'skill-workflow-leader',
    name: 'workflow-leader',
    chineseName: '项目领导工作流',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#e76f51',
    description: '项目领导工作流，当用户给出愿景希望 AI 自主、持续推进项目方向时使用。',
    longDescription: `【适用场景】
用户给出一个宏观愿景（如"做一个像素游戏背包展示系统"），
希望 Agent 自主规划方向、拆解任务、持续推进。

【与 manage-tasks 的区别】
- workflow-leader：从愿景出发，自主规划方向和优先级；
- workflow-manage-tasks：一次给出多条任务，协调多个子代理并行执行。

leader 是"想做什么"，manage-tasks 是"怎么分配做"。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/workflow-leader <your-agent-dir>/',
    tags: ['Leadership', 'Vision', 'Autonomous', 'Workflow'],
    highlights: ['愿景驱动', '自主规划', '持续推进'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-workflow-manage-tasks',
    name: 'workflow-manage-tasks',
    chineseName: '任务分派工作流',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#457b9d',
    description: '任务分派工作流，当用户一次提出多条任务、需要协调多个子代理时使用。',
    longDescription: `【核心流程】
1. 接收用户一次提出的多个任务；
2. 分析任务间的依赖关系；
3. 将独立任务分派给不同子代理并行执行；
4. 有依赖的任务按序串行；
5. 汇总各子代理结果。

【与 leader 的区别】
manage-tasks 是执行层的任务分配，leader 是方向层的愿景规划。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/workflow-manage-tasks <your-agent-dir>/',
    tags: ['Task Management', 'Multi-Agent', 'Coordination', 'Workflow'],
    highlights: ['多任务并行', '依赖分析', '子代理协调'],
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-workflow-research-plan',
    name: 'workflow-research-plan',
    chineseName: '调研设计工作流',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'search',
    customColor: '#7209b7',
    description: '需求调研设计工作流，进行中等以上规模需求开发、架构设计和重构前必须遵守。',
    longDescription: `【前置门槛】
任何中等以上规模的需求开发、架构设计和重构，
必须先走完本工作流的调研与设计阶段，才能进入实施。

【流程】
1. Research：调研现状、best practice、技术选型；
2. Plan：输出结构化设计文档，包含架构图、数据流、关键决策；
3. Review：cross-check 设计合理性；
4. 才进入 implement-review 流程。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/workflow-research-plan <your-agent-dir>/',
    tags: ['Research', 'Planning', 'Architecture', 'Must-Read'],
    highlights: ['调研先行', '结构化设计', 'cross-check 把关'],
    tips: '中等以上规模开发前必须走这个流程，先想清楚再动手！',
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-workflow-troubleshoot',
    name: 'workflow-troubleshoot',
    chineseName: '根因分析工作流',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'flame',
    customColor: '#d00000',
    description: '根因分析工作流，排查复杂问题时必须遵守此流程分析原因。',
    longDescription: `【流程】
1. 现象收集：完整记录故障现象、触发条件、环境信息；
2. 假设生成：基于现象列出所有可能的根因假设；
3. 假设验证：逐个设计验证实验，排除或确认假设；
4. 根因确认：定位到唯一根因；
5. 修复方案：针对根因而非症状给出修复；
6. 验证回归：修复后验证不再复现。

【与 unstuck 的关系】
unstuck 是"两次失败就停"，troubleshoot 是"停下来后的系统分析方法"。`,
    author: 'John Ren',
    installCommand: 'cp -r ~/.agents/skills/workflow-troubleshoot <your-agent-dir>/',
    tags: ['Troubleshooting', 'Root Cause', 'Workflow', 'Must-Read'],
    highlights: ['假设驱动分析', '根因而非症状', '验证回归'],
    tips: '复杂问题排查必须走这个流程，别凭直觉乱改！',
    createdDate: '2026-09-10'
  },
  {
    id: 'skill-max-effort',
    name: 'max-effort',
    chineseName: '极致交付模式',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'cpu',
    customColor: '#e63946',
    description: '在对用户精力消耗最少的情况下，将简略 idea 转变为极致体验的完整可交付产物。',
    longDescription: `【核心理念】
用户给一个 idea，Agent 自主完成从设计到交付的全链路：
- 自主调研、规划、实施、测试、文档化；
- 端到端测试子代理验证功能与体验；
- 决策台账留痕，交付时输出审计包。

【与 full-auto 的区别】
full-auto 只是把决策交给 auto_human 子代理；
max-effort 进一步追求极致质量，自动拉起 e2e-tester 子代理进行端到端测试，
确保不只是"能跑"而是"好用"。

【推荐用法】
/max-effort autoplay
夜间无人值守，一次性交付完整功能。`,
    author: 'john-walks-slow',
    installCommand: 'apm install -g john-walks-slow/rabbit-skills',
    tags: ['Automation', 'Quality', 'E2E', 'Max-Effort'],
    highlights: ['极致质量', '端到端测试', '审计包输出', '用户精力最小化'],
    tips: 'full-auto 的进化版，推荐替代 full-auto 使用。',
    createdDate: '2026-09-15'
  },
  {
    id: 'skill-spawn-e2e-tester',
    name: 'spawn-e2e-tester',
    chineseName: '端到端测试子代理调度',
    category: 'skills',
    subCategory: 'rabbit-skills',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'check-circle-2',
    customColor: '#06d6a0',
    description: '使用 e2e-tester 子代理对指定功能/修复执行端到端测试，输出含证据的测试报告。',
    longDescription: `【子代理能力】
e2e-tester 子代理执行两类测试：
1. 功能类测试：验证功能是否按预期工作；
2. 体验类测试：验证用户交互体验是否流畅。

输出结构化测试报告，包含：
- 测试项清单；
- 每项的结论（通过/失败/警告）；
- 支撑证据（截图、日志、实际行为描述）。

【与 spawn-reviewer 的区别】
spawn-reviewer 审查代码质量（静态）；
spawn-e2e-tester 验证运行行为（动态）。`,
    author: 'john-walks-slow',
    installCommand: 'apm install -g john-walks-slow/rabbit-skills',
    tags: ['E2E', 'Testing', 'Subagent', 'Quality'],
    highlights: ['功能+体验双测', '证据驱动', '结构化报告'],
    createdDate: '2026-09-15'
  }
];

export const MCP_DATA: InventoryItem[] = [
  {
    id: 'mcp-degoog',
    name: 'degoog',
    chineseName: 'Degoog 隐私聚合元搜索引擎',
    category: 'mcp',
    subCategory: 'search',
    rarity: 'iridium',
    stackSize: 1,
    iconType: 'search',
    customColor: '#4361ee',
    description: '本地私有化部署的多源搜索聚合 MCP 服务器，一键汇总 Google、DuckDuckGo 与 Brave 结果。',
    longDescription: `【为什么需要本地元搜索 MCP】
依赖商业 Search API 不仅成本高昂，而且经常遭遇速率限制。Degoog 运行在本地混合代理下，能并发向全球主流引擎发送查询并进行去重、相关度重新打分与结构化 JSON 提取，是 Agent 掌握最新信息的最强眼目。`,
    version: '2.4.0',
    author: 'Degoog Community / Modded by John',
    installCommand: `// dsh mcp 配置
{
  "mcpServers": {
    "degoog": {
      "command": "node",
      "args": ["/root/mcp/degoog-mcp/dist/index.js"],
      "env": { "DEGOOG_URL": "http://127.0.0.1:8080" }
    }
  }
}`,
    tags: ['Search', 'Privacy', 'Aggregator', 'High-Speed'],
    highlights: ['多引擎并发融合', '本地免费调用', '支持一键 Markdown Scrape'],
    tips: '配合 scrape 工具直接提取正文 Markdown，大幅削减网页废话。',
    createdDate: '2026-06-20'
  },
  {
    id: 'mcp-exa',
    name: 'exa',
    chineseName: 'Exa 语义神经搜索与网页阅读',
    category: 'mcp',
    subCategory: 'research',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'compass',
    customColor: '#7209b7',
    description: '基于 Embedding 语义匹配的新一代 AI 原生搜索引擎，搜技术博客和论文的利器。',
    longDescription: `区别于传统关键字命中，Exa 允许你用自然语言描述“理想的页面内容”（如：详细对比 React 与 Vue 性能与 SSR 机制的技术博客），支持直接返回清洗过的纯净 Markdown。`,
    version: '1.2.0',
    author: 'Exa AI',
    tags: ['Neural Search', 'Semantic', 'Markdown Extraction'],
    highlights: ['语义联想超强', '直接返回干净正文', '支持企业与人员维度过滤'],
    createdDate: '2026-07-15'
  },
  {
    id: 'mcp-notebooklm',
    name: 'notebooklm',
    chineseName: 'Google NotebookLM 知识库桥接',
    category: 'mcp',
    subCategory: 'research',
    rarity: 'gold',
    stackSize: 1,
    iconType: 'book-marked',
    customColor: '#f72585',
    description: '连接 Google NotebookLM 专属笔记本，进行高质量长文档研读与播客式总结。',
    longDescription: `将数十篇技术白皮书、PDF 和源码目录一键挂载到 NotebookLM，由其百万级上下文窗口进行交叉检索并经由 MCP 无缝喂给本地 Agent。`,
    version: '0.9.4',
    author: 'Community',
    tags: ['Knowledge Base', 'NotebookLM', 'Research', 'RAG'],
    highlights: ['百万 Token 文档检索', '精确事实溯源', '支持生成音频讨论草稿'],
    createdDate: '2026-08-05'
  }
];

export const BOOKS_DATA: BookDocument[] = [
  {
    id: 'orphan-process-cpu-pitfall',
    title: '【实战排坑】孤儿 Vite 进程霸占 80% CPU 的排查与优雅杀死规范',
    subtitle: '骁龙 865 手机容器发烫卡顿背后的进程树断裂迷局',
    category: 'books',
    subCategory: 'pitfalls',
    author: 'John Ren',
    readTime: '8 分钟',
    date: '2026-09-14',
    iconType: 'flame',
    rarity: 'iridium',
    summary: '记录一次在没有 systemd 的 chroot Android 容器中，由于未处理 SIGTERM/SIGHUP 导致数十个 Vite 编译器持续在后台死循环消耗 CPU 的完整排查与解决记录。',
    tags: ['Process Management', 'CPU Leak', 'Termux', 'Linux'],
    content: `# 孤儿 Vite 进程霸占 80% CPU 的排查与优雅杀死规范

## 一、故障现象：手机发烫与响应骤降

在红米 K30S Ultra（骁龙 865，LineageOS 23.2）的 chroot Ubuntu 24.04 容器中，用户反馈使用 DSH 进行交互时出现明显的迟滞。执行 \`top\` 观察发现：
- CPU 空闲率（id）跌至 10% 以下；
- 负载均值（Load Average）高达 8.42；
- 列表中存在 3 个 \`node /root/projects/.../node_modules/vite/bin/vite.js\` 进程，各个稳占 25%~30% 的 CPU 核心。

奇怪的是，在 DSH 的 Web 终端中并未查看到对应项目的前台任务。

---

## 二、根因定位：断裂的进程树（Process Disassociation）

在非标准容器（Termux + chroot，PID 1 为 Android 的 \`init\`）中，不存在常规 Linux 的 \`systemd --user\` 会话监控。

当一个 Agent 通过后台子进程启动 \`pnpm dev\` 或 \`vite\` 时：
1. Vite 启动了自身的主进程；
2. Vite 又通过 \`child_process.fork\` 启动了 esbuild / rollup 编译工作进程；
3. 如果父任务由于会话重启、超时代替或非优雅退出（SIGKILL）中断，操作系统会将子进程托孤给 PID 1；
4. **esbuild 的文件监听器（inotify/fsevents）在某些 chroot 环境下陷入了密集无阻塞 poll 循环**，导致 CPU 占用直接顶格！

---

## 三、排查利器与实战命令

### 1. 定位到底是谁在吃 CPU
\`\`\`bash
# 查看吃 CPU 最凶的前 5 个 node 进程及其运行时间
ps -eo pid,ppid,%cpu,etime,cmd --sort=-%cpu | grep node | head -n 6
\`\`\`

### 2. 检查父子进程关系树
\`\`\`bash
pstree -p -s <PID>
\`\`\`
你会发现其父进程变成了 \`init(1)\` 或 \`termux-services\`，证明已是孤儿进程。

---

## 四、安全杀死与根治防护方案

### 方案 A：针对性批量收割孤儿 Node 进程
\`\`\`bash
# 谨防误杀 DSH 自身（DSH 也在 node 下运行），必须精准正则匹配！
ps -ef | grep "vite/bin/vite" | grep -v grep | awk '{print $2}' | xargs -r kill -9
\`\`\`

### 方案 B：在启动脚本中引入 \`exec\` 与进程组清理
编写启动脚本时，务必使用以下范式包裹：
\`\`\`bash
#!/bin/bash
# 开启作业控制，使信号能下发给整个进程组
set -m
# 捕获退出信号
trap 'kill -- -$$' SIGINT SIGTERM EXIT

vite --host 0.0.0.0 --port 5180 &
wait $!
\`\`\`

---

## 五、总结与经验条目

1. **容器无小事**：没有 systemd 的环境必须格外警惕子进程托管问题；
2. **监控警报**：建议在 DSH 心跳任务中加入定期的 CPU 异常检测脚本；
3. **保持冷酷**：凡是占用 CPU > 50% 且运行超过 2 小时的非守护进程，坚决排查其正当性！`
  },
  {
    id: 'container-devfs-rules',
    title: '【核心铁律】容器 Devfs 架构与 /dev /proc /sys 安全避坑手册',
    subtitle: '写错一个重定向，导致全盘只读与宿主崩溃的惨痛教训',
    category: 'books',
    subCategory: 'container',
    author: 'John Ren',
    readTime: '12 分钟',
    date: '2026-08-28',
    iconType: 'shield-alert',
    rarity: 'iridium',
    summary: '深入剖析 Android 内核 SELinux 约束下的 chroot mount 机制，为什么绝对不能在 rootfs 创建伪设备节点，以及 /dev/shm 内存共享通信的最佳实践。',
    tags: ['Kernel', 'Devfs', 'Chroot', 'SELinux'],
    content: `# 容器 Devfs 架构与 /dev /proc /sys 安全避坑手册

## 铁律概括：永远不要试图向 chroot 的 /dev 写入普通文件！

在宿主与容器共享命名空间的极简 Linux 容器中，新手最常犯的一个毁灭性错误就是：
\`\`\`bash
# 致命操作示例！
echo "test" > /dev/null
\`\`\`
如果此时 \`/dev\` 挂载点尚未正确绑定宿主的 \`tmpfs\`，这一行命令就会在 rootfs 文件系统上创建一个名为 \`null\` 的**普通文件**，彻底覆盖并遮蔽原本的字符设备节点！

---

## 连锁灾难后果

1. **git / apt 崩溃**：无法打开 \`/dev/urandom\` 或写入 \`/dev/null\`，报 \`EACCES (Permission Denied)\`；
2. **多进程共享内存失效**：Python \`multiprocessing\` 和 PyTorch 依赖 \`/dev/shm\`，缺少 tmpfs 挂载时直接抛出 \`sem_open: No such file or directory\`；
3. **PTY 伪终端错乱**：无法分配交互式 TTY，SSH / noVNC 会话瞬间断开。

---

## Canonical 挂载树基准（必须严格核对）

在启动 Ubuntu 容器脚本中，必须确保以下挂载点依序建立：

\`\`\`bash
# 1. proc & sys
mount -t proc proc /rootfs/proc
mount -t sysfs sys /rootfs/sys

# 2. devtmpfs 与绑定
mount --bind /dev /rootfs/dev
mount --bind /dev/pts /rootfs/dev/pts

# 3. 极其重要的共享内存 tmpfs
mount -t tmpfs -o rw,nosuid,nodev,noexec,mode=1777,size=2G tmpfs /rootfs/dev/shm
\`\`\`

## 紧急救砖恢复清单

若已不慎误写了普通文件破坏了设备节点：
1. 立即停止容器内所有进程；
2. 退出到 Android Termux 宿主终端；
3. 检查 \`/data/data/com.termux/files/rootfs/dev/null\` 是否为 \`c 1 3\` 字符设备；
4. 若为普通文件，直接 \`rm -f\` 删除，并重新执行挂载脚本重建绑定。`
  },
  {
    id: 'agent-context-pruning',
    title: '【架构心法】Agent 上下文自主蒸馏：从 120k 到 8k 的思维收敛',
    subtitle: '告别注意力飘逸，让复杂编码任务拥有无限续航力',
    category: 'books',
    subCategory: 'agent-tricks',
    author: 'John Ren',
    readTime: '10 分钟',
    date: '2026-09-02',
    iconType: 'sparkles',
    rarity: 'gold',
    summary: '详细介绍 dsh-clear-mind 插件的实现哲学：如何将长会话历史提炼为用户意图、关键路径、失败探索和未决行动的结构化检查点。',
    tags: ['Prompt Engineering', 'LLM Context', 'Architecture'],
    content: `# Agent 上下文自主蒸馏：从 120k 到 8k 的思维收敛

## 为什么大上下文模型依然需要清理脑髓？

当今的大语言模型普遍支持 128k 甚至 1M 的上下文窗口，许多人因此误以为“上下文塞得越满越好”。

然而在长达数十步的真实软件开发中，未修剪的历史会带来三大致命毒瘤：
1. **注意力迷失（Lost in the Middle）**：模型开始纠结于 30 步前已经被证明行不通的技术方案；
2. **推理响应变慢与费用暴增**：每生成一个 token 都要对前面十几万 token 进行全量注意力计算；
3. **幻觉放大器**：历史中残留的临时报错信息，会被模型误当作当前代码依然存在的缺陷。

---

## 四维结构化 Checkpoint 范式

通过 \`clear_mind\` 工具压缩时，必须提炼以下四维核心要素：

\`\`\`markdown
【用户核心意图 (User Intent Verbatim)】
- 保留最初的需求原话，不容任何二次歪曲。

【关键事实与落地路径 (Key Facts & Paths)】
- 已选定的技术栈、端口、文件路径、数据库命名规范。

【已确认放弃的死胡同 (Abandoned Paths & Why)】
- 尝试过但验证失败的方案及具体原因（防止后续轮次重蹈覆辙）。

【下一步明确动作 (Next Action)】
- 唤醒后第一件需要执行的最小原子化步骤。
\`\`\`

应用本范式后，原本臃肿不堪的上下文被瞬间折叠，注意力重新凝聚在终局交付之上。`
  },
  {
    id: 'remote-tunnel-security',
    title: '【安全方案】Cloudflare 命名隧道打通与 DSH 鉴权机制深度揭秘',
    subtitle: '将口袋里的手机 Agent 安全暴露到全球互联网络的完整方案',
    category: 'books',
    subCategory: 'architecture',
    author: 'John Ren',
    readTime: '6 分钟',
    date: '2026-08-15',
    iconType: 'lock',
    rarity: 'gold',
    summary: '解析如何使用 Cloudflare Named Tunnel、Zero Trust Access 与 dsh-web-transport-trust，构建无需公网 IP 的极速移动开发工作台。',
    tags: ['Cloudflare', 'Security', 'WebRTC', 'Network'],
    content: `# Cloudflare 命名隧道打通与 DSH 鉴权机制深度揭秘

## 架构拓扑设计

\`\`\`
[ 手机 Termux 容器 (DSH 4175) ]
         │
         ▼ (Local TCP)
[ cloudflared 守护进程 ]
         │
         ▼ (QUIC 协议加密隧道)
[ Cloudflare Edge CDN ]
         │
         ▼ (Zero Trust 验证 / 邮箱验证码)
[ 远程浏览器 (iPad / 笔记本) ]
\`\`\`

## 避免临时 Quick Tunnel 的坑

很多开发者习惯使用 \`cloudflared tunnel --url http://127.0.0.1:4175\` 创建临时域名（\`.trycloudflare.com\`）。
缺点是极其脆弱：一旦网络波动重连，域名即发生改变，且完全不受保护地暴露在公网！

采用 Named Tunnel 绑定自持二级域名（如 \`*.<your-domain>\`），配合 Access 规则阻拦恶意扫描，才是最稳健的极客姿态。`
  }
];
