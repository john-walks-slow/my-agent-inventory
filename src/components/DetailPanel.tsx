import React, { useState } from 'react';
import type { InventoryItem } from '../types/inventory';
import { PixelArtIcon, PixelQualityBadge } from './PixelArtIcon';
import { retroAudio } from '../audio/retroAudio';
import { ExternalLink, Copy, Check, Terminal, BookOpen, Layers } from 'lucide-react';

interface DetailPanelProps {
  item: InventoryItem | null;
  onOpenDoc?: (docId: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ item, onOpenDoc }) => {
  const [copied, setCopied] = useState(false);

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
          <PixelArtIcon name={item.iconType} size={32} />
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
          <p className="text-xs font-semibold text-[#78350f] mt-0.5">{item.chineseName}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[11px]">
            <span className="font-bold" style={{ color: rarityInfo.color }}>
              {rarityInfo.label}
            </span>
            <span className="text-[#6e2e05]/40">•</span>
            <span className="text-[#6e2e05]/80">作者: {item.author}</span>
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

        {/* Deep Dive Long Description */}
        <div>
          <h4 className="text-[11px] font-bold text-[#78350f] uppercase tracking-wider mb-1">
            📜 深度解析
          </h4>
          <div className="text-xs leading-relaxed text-[#381503] whitespace-pre-line bg-[#fdf5df] p-2 border border-[#d98236]/60 shadow-xs">
            {item.longDescription}
          </div>
        </div>

        {/* Installation Command */}
        {item.installCommand && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[11px] font-bold text-[#78350f] flex items-center gap-1">
                <Terminal size={12} /> 安装与使用指令
              </h4>
              <button
                onClick={() => handleCopy(item.installCommand!)}
                className="sdv-action-btn !py-0.5 !px-1.5 !text-[10px]"
                title="复制到剪贴板"
              >
                {copied ? <Check size={10} className="text-green-700" /> : <Copy size={10} />}
                {copied ? '已复制！' : '复制命令'}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-[#22160d] text-[#ffe4a1] p-2 border border-[#6e2e05] overflow-x-auto whitespace-pre-wrap break-all select-text">
              <code>{item.installCommand}</code>
            </pre>
          </div>
        )}

        {/* Configuration Example */}
        {item.configExample && (
          <div>
            <h4 className="text-[11px] font-bold text-[#78350f] mb-1">⚙ 配置示例 (cordis.yml)</h4>
            <pre className="text-[11px] font-mono bg-[#22160d] text-[#a8dadc] p-2 border border-[#6e2e05] overflow-x-auto whitespace-pre-wrap break-all select-text">
              <code>{item.configExample}</code>
            </pre>
          </div>
        )}

        {/* Farm Tips */}
        {item.tips && (
          <div className="p-2 bg-[#ffebbe] border border-[#b45309] text-[11px] text-[#421c08]">
            <span className="font-bold text-[#b45309]">💡 农场主秘笈: </span>
            {item.tips}
          </div>
        )}
      </div>

      {/* Fixed Sticky Footer for Actions */}
      <div className="p-2.5 bg-[#ecd0a6] border-t-2 border-[#6e2e05] flex flex-wrap items-center justify-between gap-1.5 shrink-0">
        <div className="flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.2 bg-[#fdf5df] text-[#78350f] border border-[#d98236] font-bold"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {item.docId && onOpenDoc && (
            <button
              onClick={() => {
                retroAudio.playPageTurn();
                onOpenDoc(item.docId!);
              }}
              className="sdv-action-btn !py-1 !px-2 !text-xs !bg-[#fff1d0]"
            >
              <BookOpen size={12} /> 翻阅典籍
            </button>
          )}

          {item.repoUrl && (
            <a
              href={item.repoUrl}
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
