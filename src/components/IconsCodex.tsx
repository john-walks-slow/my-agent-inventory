import React, { useMemo, useState } from 'react';
import { KIT_ICONS, KIT_GROUPS } from '../iconkit/registry';
import { KIT_ASSET_URLS } from '../iconkit/assets';
import { retroAudio } from '../audio/retroAudio';
import { getVocab } from '../theme/vocab';
import { Search, Check, ArrowLeft, ExternalLink } from 'lucide-react';

const ATTRIBUTION = {
  title: '496 Pixel Art Icons for Medieval/Fantasy RPG',
  author: 'Henrique Lazarini (7Soul1)，gnola14 整理',
  license: 'CC0 1.0 Universal (Public Domain)',
  url: 'https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg'
};

interface IconsCodexProps {
  onExit: () => void;
  theme?: string;
}

export const IconsCodex: React.FC<IconsCodexProps> = ({ onExit, theme }) => {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const vocab = getVocab(theme);

  const allIds = useMemo(() => Object.keys(KIT_ICONS).sort(), []);

  const shownIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      group === 'all'
        ? allIds
        : (KIT_GROUPS.find((g) => g.label === group)?.ids.filter((id) => id in KIT_ICONS) ?? []);
    return q ? base.filter((id) => id.includes(q)) : base;
  }, [allIds, group, query]);

  const handleCopy = async (id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(id);
      } else {
        const ta = document.createElement('textarea');
        ta.value = id;
        ta.style.position = 'fixed';
        ta.style.left = '-999999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      retroAudio.playCoin();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  };

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
              {vocab.hud.codexLink}
            </h1>
            <p className="text-[10px] text-ui-ink-muted font-semibold mt-0.5">
              内置套件 {allIds.length} 枚 · 点击复制 id · item.icon 直接引用
            </p>
          </div>
        </div>
        <div className="relative flex items-center shrink-0">
          <input
            type="text"
            placeholder="搜索 id..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-28 sm:w-40 text-xs px-1.5 py-0.5 pl-5 bg-ui-panel-light text-ui-ink placeholder-ui-ink-muted/60 border border-ui-wood-dark rounded-none focus:outline-none focus:bg-white"
          />
          <Search size={11} className="absolute left-1 text-ui-ink-muted pointer-events-none" />
        </div>
      </header>

      {/* Main frame */}
      <main className="sdv-menu-frame mt-4 p-3 sm:p-4 flex-1 flex flex-col min-h-0">
        {/* Group pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 mb-2 shrink-0">
          {[
            { label: vocab.hud.allFilter, count: allIds.length },
            ...KIT_GROUPS.map((g) => ({ label: g.label, count: g.ids.filter((id) => id in KIT_ICONS).length }))
          ].map((g) => {
            const isActive = group === g.label;
            return (
              <button
                key={g.label}
                onClick={() => {
                  retroAudio.playTab();
                  setGroup(g.label);
                }}
                className={`px-2 py-0.5 text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-ui-cell-active text-ui-ink border border-ui-wood-dark shadow-[0_1px_0_var(--color-ui-frame-border)]'
                    : 'bg-ui-accent text-white border border-ui-wood-dark hover:bg-ui-accent-hover'
                }`}
              >
                {g.label}
                <span className="text-[10px] px-0.5 opacity-80">{g.count}</span>
              </button>
            );
          })}
        </div>

        {/* Icons grid */}
        <div className="custom-scroll flex-1 min-h-0 overflow-y-auto bg-ui-panel-warm border-2 border-ui-wood-dark p-2 sm:p-3 shadow-md">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))' }}>
            {shownIds.map((id) => {
              const url = KIT_ASSET_URLS[id];
              const isCopied = copiedId === id;
              return (
                <button
                  key={id}
                  onClick={() => handleCopy(id)}
                  onMouseEnter={() => retroAudio.playHover()}
                  title={`${id} — 点击复制`}
                  className="sdv-cell flex flex-col items-center justify-center gap-0.5 aspect-square cursor-pointer p-1 group"
                >
                  {url ? (
                    <img
                      src={url}
                      alt={id}
                      width={34}
                      height={34}
                      className="shape-pixel max-w-full max-h-full transition-transform duration-75 group-hover:scale-110"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-[9px] text-red-700 font-bold">缺失</span>
                  )}
                  <span className="text-[8px] font-mono font-bold text-ui-ink-body/80 leading-none truncate w-full text-center">
                    {isCopied ? <Check size={10} className="inline text-green-700" /> : id}
                  </span>
                </button>
              );
            })}
            {shownIds.length === 0 && (
              <p className="col-span-full text-center text-xs text-ui-ink-muted font-bold py-6">
                没有匹配的图标 id
              </p>
            )}
          </div>
        </div>

        {/* Attribution footer */}
        <div className="mt-2 text-[10px] text-ui-ink-body flex flex-wrap items-center justify-between gap-1 shrink-0">
          <span>
            套件：{ATTRIBUTION.title} · {ATTRIBUTION.author} · {ATTRIBUTION.license}
          </span>
          <a
            href={ATTRIBUTION.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 text-ui-ink-amber underline font-bold"
            onClick={() => retroAudio.playSelect()}
          >
            OpenGameArt <ExternalLink size={9} />
          </a>
        </div>
      </main>
    </div>
  );
};

export default IconsCodex;
