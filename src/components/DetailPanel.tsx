import React, { useMemo, useState } from 'react';
import type { ItemView } from '../config/loader';
import { ItemIcon, PixelQualityBadge } from './ItemIcon';
import { retroAudio } from '../audio/retroAudio';
import { getVocab } from '../theme/vocab';
import { marked } from 'marked';
import { ExternalLink, Copy, Check, Terminal, Layers, Braces } from 'lucide-react';

interface DetailPanelProps {
  item: ItemView | null;
  theme?: string;
}

/** 复制按钮：install / config / schema 三块共用 */
const CopyBtn: React.FC<{ text: string; copied: boolean; onCopy: (text: string) => void; label: string; copiedLabel: string }> = ({
  text, copied, onCopy, label, copiedLabel,
}) => (
  <button
    onClick={() => onCopy(text)}
    className="sdv-action-btn !py-0.5 !px-1.5 !text-[10px]"
    title="复制到剪贴板"
  >
    {copied ? <Check size={10} className="text-green-700" /> : <Copy size={10} />}
    {copied ? copiedLabel : label}
  </button>
);

/** 从 JSON Schema inputSchema 提取参数行；非 object+properties 形态返回 null */
function schemaParams(schema: Record<string, unknown>): Array<{ name: string; type: string; required: boolean; description: string }> | null {
  if (schema.type !== 'object' || typeof schema.properties !== 'object' || schema.properties === null) return null;
  const required = new Set(Array.isArray(schema.required) ? (schema.required as string[]) : []);
  return Object.entries(schema.properties as Record<string, Record<string, unknown>>).map(([name, prop]) => ({
    name,
    type: Array.isArray(prop.type) ? (prop.type as string[]).join(' | ') : String(prop.type ?? 'any'),
    required: required.has(name),
    description: typeof prop.description === 'string' ? prop.description : '',
  }));
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ item, theme }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const vocab = getVocab(theme);

  const itemContent = item?.content;
  const renderedContent = useMemo(() => {
    if (!itemContent) return '';
    marked.setOptions({ gfm: true, breaks: true });
    return marked.parse(itemContent) as string;
  }, [itemContent]);

  const schemaJson = item?.schema ? JSON.stringify(item.schema, null, 2) : '';

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-ui-ink-muted border-2 border-ui-wood-dark bg-ui-panel rounded-sm shadow-inner">
        <div className="w-12 h-12 rounded-full border-2 border-ui-wood-dark flex items-center justify-center mb-2 bg-ui-panel-warm opacity-60">
          <Layers size={24} />
        </div>
        <p className="font-bold text-sm">{vocab.hud.emptyDetailTitle}</p>
        <p className="text-xs opacity-75 mt-0.5">{vocab.hud.emptyDetailHint}</p>
      </div>
    );
  }

  const handleCopy = async (key: string, text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      retroAudio.playCoin();
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const rarityInfo = {
    common: { label: vocab.rarity.common, color: 'var(--color-ui-frame-border)' },
    rare: { label: vocab.rarity.rare, color: 'var(--color-quality-rare-edge)' },
    epic: { label: vocab.rarity.epic, color: 'var(--color-quality-epic-edge)' },
    legendary: { label: vocab.rarity.legendary, color: 'var(--color-quality-legendary-edge)' }
  }[item.rarity];

  const params = item.schema ? schemaParams(item.schema) : null;

  return (
    <div className="flex flex-col h-full bg-ui-panel-light border-2 border-ui-wood-dark shadow-md text-ui-ink">
      {/* Top Header Card (Stardew Tooltip Header Style) */}
      <div className="p-3 bg-ui-panel border-b-2 border-ui-wood-dark flex items-start gap-3 shrink-0">
        <div className="relative w-12 h-12 sdv-cell flex items-center justify-center shrink-0">
          <ItemIcon iconRef={item.iconRef} size={32} />
          <PixelQualityBadge rarity={item.rarity} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-base font-bold tracking-wide text-ui-ink leading-tight">
              {item.name}
            </h2>
            {item.version && (
              <span className="px-1 py-0.2 text-[9px] bg-ui-accent text-white font-mono rounded-none border border-ui-wood-dark">
                v{item.version}
              </span>
            )}
          </div>
          {item.title && <p className="text-xs font-semibold text-ui-ink-muted mt-0.5">{item.title}</p>}
          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
            <span className="font-bold" style={{ color: rarityInfo.color }}>
              {rarityInfo.label}
            </span>
            {item.author && (
              <>
                <span className="text-ui-wood-dark/40">•</span>
                <span className="text-ui-wood-dark/80">作者: {item.author}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Independent Scrollable Details Area */}
      <div className="custom-scroll flex-1 p-3 space-y-2.5 overflow-y-auto">
        {/* Short Summary Description */}
        <p className="text-xs font-bold leading-relaxed text-ui-ink-body bg-ui-highlight p-2 border border-ui-accent/60 shadow-xs">
          {item.description}
        </p>

        {/* Core Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-ui-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>{vocab.detail.highlights}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {item.highlights.map((h, i) => (
                <div
                  key={i}
                  className="text-[11px] bg-ui-highlight-warm px-2 py-1 border border-ui-cell flex items-center gap-1"
                >
                  <span className="text-ui-ink-amber font-bold">✔</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 正文 Markdown：无小节标题，直接作为主体流式渲染 */}
        {renderedContent && (
          <div
            className="text-xs leading-relaxed text-ui-ink bg-ui-highlight p-2 border border-ui-accent/60 shadow-xs select-text
              [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-ui-frame-border [&_h1]:border-b [&_h1]:border-ui-wood-mid/50 [&_h1]:pb-1 [&_h1]:mt-2
              [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-ui-wood-dark [&_h2]:mt-2.5 [&_h2]:mb-0.5
              [&_h3]:text-[11px] [&_h3]:font-bold [&_h3]:text-ui-ink-amber
              [&_p]:leading-relaxed [&_p]:my-1
              [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1
              [&_pre]:bg-ui-bg-deep [&_pre]:text-ui-ink-gold [&_pre]:p-2 [&_pre]:my-1.5 [&_pre]:border [&_pre]:border-ui-wood-dark [&_pre]:overflow-x-auto
              [&_code]:font-mono [&_code]:text-[11px]
              [&_blockquote]:border-l-3 [&_blockquote]:border-ui-wood-mid [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-ui-wood-dark [&_blockquote]:my-1.5
              [&_table]:w-full [&_table]:text-[11px] [&_table]:my-1.5
              [&_th]:bg-ui-panel [&_th]:border [&_th]:border-ui-wood-dark/50 [&_th]:px-1.5 [&_th]:py-0.5
              [&_td]:border [&_td]:border-ui-wood-dark/50 [&_td]:px-1.5 [&_td]:py-0.5
              [&_a]:text-ui-ink-amber [&_a]:underline
            "
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}

        {/* Installation Command */}
        {item.install && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[11px] font-bold text-ui-ink-muted flex items-center gap-1">
                <Terminal size={12} /> {vocab.detail.install}
              </h4>
              <CopyBtn text={item.install} copied={copiedKey === 'install'} onCopy={(t) => handleCopy('install', t)} label={vocab.detail.copy} copiedLabel={vocab.detail.copied} />
            </div>
            <pre className="text-[11px] font-mono bg-ui-bg-deep text-ui-ink-gold p-2 border border-ui-wood-dark overflow-x-auto whitespace-pre-wrap break-all select-text">
              <code>{item.install}</code>
            </pre>
          </div>
        )}

        {/* Configuration Example */}
        {item.config && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[11px] font-bold text-ui-ink-muted">{vocab.detail.config}</h4>
              <CopyBtn text={item.config} copied={copiedKey === 'config'} onCopy={(t) => handleCopy('config', t)} label={vocab.detail.copy} copiedLabel={vocab.detail.copied} />
            </div>
            <pre className="text-[11px] font-mono bg-ui-bg-deep text-ui-code-ink p-2 border border-ui-wood-dark overflow-x-auto whitespace-pre-wrap break-all select-text">
              <code>{item.config}</code>
            </pre>
          </div>
        )}

        {/* Tool Input Schema */}
        {item.schema && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[11px] font-bold text-ui-ink-muted flex items-center gap-1">
                <Braces size={12} /> {vocab.detail.schema}
              </h4>
              <CopyBtn text={schemaJson} copied={copiedKey === 'schema'} onCopy={(t) => handleCopy('schema', t)} label={vocab.detail.copy} copiedLabel={vocab.detail.copied} />
            </div>
            {params ? (
              <div className="border border-ui-wood-dark bg-ui-panel">
                {params.map((p) => (
                  <div key={p.name} className="px-2 py-1 border-b border-ui-wood-dark/40 last:border-b-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="text-[11px] font-bold text-ui-ink">{p.name}</code>
                      <span className="text-[9px] px-1 bg-ui-highlight-warm border border-ui-wood-mid/50 text-ui-ink-muted font-mono">{p.type}</span>
                      {p.required && <span className="text-[9px] font-bold text-ui-danger">必填</span>}
                    </div>
                    {p.description && <p className="text-[10px] text-ui-ink-muted leading-snug mt-0.5">{p.description}</p>}
                  </div>
                ))}
              </div>
            ) : null}
            <details className="mt-1">
              <summary className="text-[10px] text-ui-ink-muted cursor-pointer select-none">JSON</summary>
              <pre className="mt-1 text-[10px] font-mono bg-ui-bg-deep text-ui-code-ink p-2 border border-ui-wood-dark overflow-x-auto whitespace-pre-wrap break-all select-text max-h-64 overflow-y-auto custom-scroll">
                <code>{schemaJson}</code>
              </pre>
            </details>
          </div>
        )}

        {/* Owner Note */}
        {item.note && (
          <div className="p-2 bg-ui-cell-edge-light border border-ui-ink-amber text-[11px] text-ui-ink-body">
            <span className="font-bold text-ui-ink-amber">{vocab.detail.note}: </span>
            {item.note}
          </div>
        )}
      </div>

      {/* Fixed Sticky Footer for Actions */}
      <div className="p-2.5 bg-ui-panel border-t-2 border-ui-wood-dark flex flex-wrap items-center justify-between gap-1.5 shrink-0">
        <div className="flex flex-wrap gap-1">
          {(item.tags ?? []).map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.2 bg-ui-highlight text-ui-ink-muted border border-ui-accent font-bold"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {item.repo && (
            <a
              href={item.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="sdv-action-btn !py-1 !px-2 !text-xs"
              onClick={() => retroAudio.playSelect()}
            >
              <ExternalLink size={12} /> {vocab.detail.repo}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
