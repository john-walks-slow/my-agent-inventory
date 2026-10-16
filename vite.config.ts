import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse, stringify } from 'yaml'
import { siteConfigSchema, formatIssues } from './src/config/schema'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * harness 配置守卫：
 * - buildStart / watchChange：YAML 语法 + schema 校验，坏配置直接在终端报错（路径精确到字段）
 * - transformIndexHtml：从配置注入 <title> 与 OG meta
 */
function harnessConfigPlugin(): Plugin {
  const cfgPath = resolve(root, 'config/harness.yaml')

  const load = () => {
    const raw = readFileSync(cfgPath, 'utf8')
    let data: unknown
    try {
      data = parse(raw)
    } catch (e) {
      throw new Error(`[harness-config] YAML 语法错误: ${(e as Error).message}`)
    }
    const result = siteConfigSchema.safeParse(data)
    if (!result.success) {
      throw new Error(`[harness-config] 校验失败:\n${formatIssues(result.error)}`)
    }
    return result.data
  }

  return {
    name: 'harness-config-guard',
    buildStart() {
      load()
      console.log('[harness-config] 校验通过')
    },
    watchChange(id) {
      if (id === cfgPath) {
        load() // 抛错会在终端与 dev overlay 呈现
        console.log('[harness-config] 重新校验通过')
      }
    },
    transformIndexHtml(html) {
      let title = 'My Harness Inventory'
      let subtitle = ''
      try {
        const cfg = load()
        title = cfg.site.title
        subtitle = cfg.site.subtitle ?? ''
      } catch {
        // 校验已在 buildStart 报错；此处保持静态回退
      }
      const tags = [
        { tag: 'meta' as const, attrs: { property: 'og:title', content: title } },
        { tag: 'meta' as const, attrs: { property: 'og:description', content: subtitle } },
        { tag: 'meta' as const, attrs: { property: 'og:type', content: 'website' } },
      ]
      const titleInjected = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      return { html: titleInjected, tags }
    },
  }
}

/**
 * private 条目构建期剔除：
 * 静态站会把 harness.yaml 原文与全部正文 glob 打进产物，仅运行时过滤挡不住扒源码。
 * 本插件在 load 阶段把 private 条目从 harness.yaml 中删掉、其正文替换为空串，
 * 产物里不留任何痕迹；仓库源文件不动（本人维护用），loader 侧另有运行时过滤兜底。
 */
function privateScrubPlugin(): Plugin {
  const cfgPath = resolve(root, 'config/harness.yaml')
  const data = parse(readFileSync(cfgPath, 'utf8')) as {
    sections: Array<{ id: string; items: Array<{ id: string; private?: boolean }> }>
  }
  const privateKeys = new Set<string>()
  for (const sec of data.sections ?? []) {
    for (const item of sec.items ?? []) {
      if (item.private) privateKeys.add(`${sec.id}/${item.id}`)
    }
  }
  const sanitizedYaml = (() => {
    const clone = structuredClone(data) as typeof data
    for (const sec of clone.sections ?? []) {
      sec.items = (sec.items ?? []).filter((item) => !item.private)
    }
    return stringify(clone)
  })()

  return {
    name: 'private-scrub',
    enforce: 'pre',
    transform(code, id) {
      // glob 的 key 是文件路径字符串，仅置空内容仍会把 private 条目 id 留在产物里；
      // 把 loader 的 content glob 改写为带否定模式的数组，private 正文文件根本不进包
      if (id.split('?')[0].endsWith('/src/config/loader.ts') && privateKeys.size > 0) {
        const patterns = [
          `'/config/content/**/*.md'`,
          ...[...privateKeys].map((k) => `'!/config/content/${k}.md'`),
        ].join(', ')
        return code.replace(
          `import.meta.glob('/config/content/**/*.md',`,
          `import.meta.glob([${patterns}],`
        )
      }
      return null
    },
    load(id) {
      const clean = id.split('?')[0]
      if (clean === cfgPath) {
        return `export default ${JSON.stringify(sanitizedYaml)}`
      }
      const m = /\/config\/content\/(.+)\.md$/.exec(clean)
      if (m && privateKeys.has(m[1])) {
        return `export default ""`
      }
      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    privateScrubPlugin(),
    tailwindcss(),
    react(),
    harnessConfigPlugin(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.trycloudflare.com'],
  }
})
