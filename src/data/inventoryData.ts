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
    subCategory: 'workflow',
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
    subCategory: 'office',
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
