import React, { useMemo, useState } from 'react';
import { retroAudio } from '../audio/retroAudio';
import { BADGE_THEMES } from '../badge/themes';
import { THEMES } from '../config/schema';
import { getVocab } from '../theme/vocab';
import { Check, Copy, ArrowLeft } from 'lucide-react';

interface BadgeViewProps {
  onExit: () => void;
  theme?: string;
}

type SnippetKind = 'url' | 'markdown' | 'html';

/** 复制到剪贴板（与 DetailPanel 同策略：安全上下文走 API，否则隐藏 textarea 兜底） */
async function copyText(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-999999px';
      ta.style.top = '-999999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  } catch {
    // ignore
  }
}

export const BadgeView: React.FC<BadgeViewProps> = ({ onExit, theme }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const vocab = getVocab(theme);

  const base = useMemo(() => {
    const { origin, pathname } = window.location;
    return `${origin}${pathname.replace(/\/[^/]*$/, '/')}`;
  }, []);

  const activeTheme = theme ?? 'stardew';

  const snippets = (id: string): Record<SnippetKind, string> => {
    const url = `${base}badges/${id}.svg`;
    return {
      url,
      markdown: `[![harness badge](${url})](${base})`,
      html: `<a href="${base}"><img src="${url}" alt="harness badge" width="480" height="160"></a>`,
    };
  };

  const handleCopy = async (key: string, text: string) => {
    await copyText(text);
    retroAudio.playCoin();
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyBtn = (key: string, kind: SnippetKind, text: string) => (
    <button
      key={kind}
      onClick={() => handleCopy(key, text)}
      onMouseEnter={() => retroAudio.playHover()}
      className="sdv-action-btn !py-0.5 !px-1.5 !text-[10px] flex items-center gap-0.5"
    >
      {copied === key ? <Check size={10} className="text-green-700" /> : <Copy size={10} />}
      {copied === key ? '已复制！' : kind === 'url' ? '链接' : kind === 'markdown' ? 'Markdown' : 'HTML'}
    </button>
  );

  return (
    <div className="min-h-screen w-screen p-2 sm:p-4 max-w-6xl mx-auto flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 bg-ui-panel border-2 border-ui-frame-border shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              retroAudio.playTab();
              onExit();
            }}
            className="sdv-action-btn !py-1 !px-2 text-xs"
          >
            <ArrowLeft size={12} /> 返回背包
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-ui-ink leading-none">
              {vocab.hud.badgeLink}
            </h1>
            <p className="text-[10px] text-ui-ink-muted font-semibold mt-0.5">
              随主题生成的游戏名片 · 可嵌入 README / 博客 / 任意网页
            </p>
          </div>
        </div>
      </header>

      {/* Main frame */}
      <main className="sdv-menu-frame mt-4 p-3 sm:p-4 flex-1 flex flex-col min-h-0">
        <div className="custom-scroll flex-1 min-h-0 overflow-y-auto space-y-3">
          {THEMES.map((id) => {
            const spec = BADGE_THEMES[id];
            const snips = snippets(id);
            const key = (kind: SnippetKind) => `${id}:${kind}`;
            return (
              <div
                key={id}
                className={`p-2.5 border-2 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 ${
                  id === activeTheme ? 'border-ui-frame-border bg-ui-cell-active' : 'border-ui-wood-mid/60 bg-ui-panel'
                }`}
              >
                <img
                  src={`badges/${id}.svg`}
                  alt={`${spec.label} badge`}
                  width={480}
                  height={160}
                  className="w-full sm:w-[360px] shrink-0 shape-pixel"
                  style={{ imageRendering: 'auto' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-ui-ink">{spec.label}</span>
                    {id === activeTheme && (
                      <span className="text-[9px] px-1 py-0.2 bg-ui-accent text-white font-bold border border-ui-wood-dark">
                        当前主题
                      </span>
                    )}
                    <span className="text-[9px] text-ui-ink-muted font-mono">badges/{id}.svg</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {copyBtn(key('url'), 'url', snips.url)}
                    {copyBtn(key('markdown'), 'markdown', snips.markdown)}
                    {copyBtn(key('html'), 'html', snips.html)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* 默认 badge 说明 + 拥有方式 */}
          <div className="p-2.5 border-2 border-dashed border-ui-wood-mid/60 bg-ui-highlight-warm text-[11px] text-ui-ink-body space-y-1">
            <p>
              <span className="font-bold">badge.svg</span> 始终跟随 <code className="font-mono">site.theme</code> 当前主题（现为 <span className="font-bold">{activeTheme}</span>），直接引用 <code className="font-mono">{base}badge.svg</code> 即可。
            </p>
            <p>
              想要自己的背包？<code className="font-mono">npx degit &lt;repo&gt; my-harness-inventory</code> 拉取白板模板，按 README 填入你的 harness 配置，徽章会随构建自动重新生成。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BadgeView;
