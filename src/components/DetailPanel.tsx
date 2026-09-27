import React, { useMemo, useState } from 'react';
import type { ItemView } from '../config/loader';
import { ItemIcon, PixelQualityBadge } from './ItemIcon';
import { retroAudio } from '../audio/retroAudio';
import { marked } from 'marked';
import { ExternalLink, Copy, Check, Terminal, Layers } from 'lucide-react';

interface DetailPanelProps {
  item: ItemView | null;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ item }) => {
  const [copied, setCopied] = useState(false);

  const itemContent = item?.content;
  const renderedContent = useMemo(() => {
    if (!itemContent) return '';
    marked.setOptions({ gfm: true, breaks: true });
    return marked.parse(itemContent) as string;
  }, [itemContent]);

  if (!item) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#78350f] border-2 border-[#6e2e05] bg-[#ecd0a6] rounded-sm shadow-inner">
        <div className="w-12 h-12 rounded-full border-2 border-[#6e2e05] flex items-center justify-center mb-2 bg-[#f0c38e] opacity-60">
          <Layers size={24} />
        </div>
        <p className="font-bold text-sm">请点击背包中的装备</p>
        <p className="text-xs opacity-75 mt-0.5">查看设计原理、配置与安装方式</p>
      </div>
    );
  }

  const handleCopy = async (text: string) => {
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const rarityInfo = {
    normal: { label: '普通品质', color: '#4a2113' },
    silver: { label: '银星品质 (Silver)', color: '#64748b' },
    gold: { label: '金星品质 (Gold)', color: '#b45309' },
    iridium: { label: '铱星品质 (Iridium ★)', color: '#9333ea' }
  }[item.rarity];

  return (
    <div className="flex flex-col h-full bg-[#fff6e0] border-2 border-[#6e2e05] shadow-md text-[#381503]">
      {/* Top Header Card (Stardew Tooltip Header Style) */}
      <div className="p-3 bg-[#ecd0a6] border-b-2 border-[#6e2e05] flex items-start gap-3 shrink-0">
        <div className="relative w-12 h-12 sdv-cell flex items-center justify-center shrink-0">
          <ItemIcon iconRef={item.iconRef} size={32} />
          <PixelQualityBadge rarity={item.rarity} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h2 className="text-base font-bold tracking-wide text-[#381503] leading-tight">
              {item.name}
            </h2>
            {item.version && (
              <span className="px-1 py-0.2 text-[9px] bg-[#d98236] text-[#fff] font-mono rounded-none border border-[#6e2e05]">
                v{item.version}
              </span>
            )}
          </div>
          {item.title && <p className="text-xs font-semibold text-[#78350f] mt-0.5">{item.title}</p>}
          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
            <span className="font-bold" style={{ color: rarityInfo.color }}>
              {rarityInfo.label}
            </span>
            {item.author && (
              <>
                <span className="text-[#6e2e05]/40">•</span>
                <span className="text-[#6e2e05]/80">作者: {item.author}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Independent Scrollable Details Area */}
      <div className="custom-scroll flex-1 p-3 space-y-2.5 overflow-y-auto">
        {/* Short Summary Description */}
        <p className="text-xs font-bold leading-relaxed text-[#421c08] bg-[#fdf5df] p-2 border border-[#d98236]/60 shadow-xs">
          {item.description}
        </p>

        {/* Core Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-[#78350f] uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>✦ 核心亮点</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {item.highlights.map((h, i) => (
                <div
                  key={i}
                  className="text-[11px] bg-[#fdecd2] px-2 py-1 border border-[#e6a763] flex items-center gap-1"
                >
                  <span className="text-[#b45309] font-bold">✔</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deep Dive Markdown Body */}
        {renderedContent && (
          <div>
            <h4 className="text-[11px] font-bold text-[#78350f] uppercase tracking-wider mb-1">
              📜 深度解析
            </h4>
            <div
              className="text-xs leading-relaxed text-[#381503] bg-[#fdf5df] p-2 border border-[#d98236]/60 shadow-xs select-text
                [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#4a2113] [&_h1]:border-b [&_h1]:border-[#8d562b]/50 [&_h1]:pb-1 [&_h1]:mt-2
                [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-[#6e2e05] [&_h2]:mt-2.5 [&_h2]:mb-0.5
                [&_h3]:text-[11px] [&_h3]:font-bold [&_h3]:text-[#b45309]
                [&_p]:leading-relaxed [&_p]:my-1
                [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1
                [&_pre]:bg-[#22160d] [&_pre]:text-[#ffe4a1] [&_pre]:p-2 [&_pre]:my-1.5 [&_pre]:border [&_pre]:border-[#6e2e05] [&_pre]:overflow-x-auto
                [&_code]:font-mono [&_code]:text-[11px]
                [&_blockquote]:border-l-3 [&_blockquote]:border-[#8d562b] [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-[#6e2e05] [&_blockquote]:my-1.5
                [&_table]:w-full [&_table]:text-[11px] [&_table]:my-1.5
                [&_th]:bg-[#ecd0a6] [&_th]:border [&_th]:border-[#6e2e05]/50 [&_th]:px-1.5 [&_th]:py-0.5
                [&_td]:border [&_td]:border-[#6e2e05]/50 [&_td]:px-1.5 [&_td]:py-0.5
                [&_a]:text-[#b45309] [&_a]:underline
              "
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>
        )}

        {/* Installation Command */}
        {item.install && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[11px] font-bold text-[#78350f] flex items-center gap-1">
                <Terminal size={12} /> 安装与使用指令
              </h4>
              <button
                onClick={() => handleCopy(item.install!)}
                className="sdv-action-btn !py-0.5 !px-1.5 !text-[10px]"
                title="复制到剪贴板"
              >
                {copied ? <Check size={10} className="text-green-700" /> : <Copy size={10} />}
                {copied ? '已复制！' : '复制命令'}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-[#22160d] text-[#ffe4a1] p-2 border border-[#6e2e05] overflow-x-auto whitespace-pre-wrap break-all select-text">
              <code>{item.install}</code>
            </pre>
          </div>
        )}

        {/* Configuration Example */}
        {item.config && (
          <div>
            <h4 className="text-[11px] font-bold text-[#78350f] mb-1">⚙ 配置示例</h4>
            <pre className="text-[11px] font-mono bg-[#22160d] text-[#a8dadc] p-2 border border-[#6e2e05] overflow-x-auto whitespace-pre-wrap break-all select-text">
              <code>{item.config}</code>
            </pre>
          </div>
        )}

        {/* Owner Note */}
        {item.note && (
          <div className="p-2 bg-[#ffebbe] border border-[#b45309] text-[11px] text-[#421c08]">
            <span className="font-bold text-[#b45309]">💡 装备备注: </span>
            {item.note}
          </div>
        )}
      </div>

      {/* Fixed Sticky Footer for Actions */}
      <div className="p-2.5 bg-[#ecd0a6] border-t-2 border-[#6e2e05] flex flex-wrap items-center justify-between gap-1.5 shrink-0">
        <div className="flex flex-wrap gap-1">
          {(item.tags ?? []).map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.2 bg-[#fdf5df] text-[#78350f] border border-[#d98236] font-bold"
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
              <ExternalLink size={12} /> 仓库
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
