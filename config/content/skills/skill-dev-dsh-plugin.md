## 避坑重点
1. pnpm link 依赖缺失陷阱：link 包的依赖必须显式声明并本地安装，否则 DSH 启动 ESM 解析失败直接整机 STOPPED！
2. ctx.inject 强校验：访问未在 inject 数组声明的 ctx 服务直接报错；
3. Web Client Bundle 构建：构建产物缺少会导致 Web 端 bootstrap facade missing。
