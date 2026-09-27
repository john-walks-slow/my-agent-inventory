import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
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

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
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
