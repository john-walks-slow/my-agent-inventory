import React, { useState } from 'react';
import type { InventoryItem } from '../types/inventory';
import { PixelIcon, QualityStar } from './PixelIcon';
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
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#853605] border-4 border-[#853605] bg-[#e4ae6e] rounded-sm shadow-inner">
        <div className="w-16 h-16 rounded-full border-4 border-[#853605] flex items-center justify-center mb-3 bg-[#f7cb88] opacity-60">
          <Layers size={32} />
        </div>
        <p className="font-bold text-lg">请点击左侧背包中的物品</p>
        <p className="text-xs opacity-75 mt-1">查看详细介绍、配置示例、安装指令与关联避坑技巧</p>
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

  const rarityText = {
    normal: '普通品质 (Normal)',
    silver: '银星品质 (Silver)',
    gold: '金星品质 (Gold)',
    iridium: '铱星品质 (Iridium ⭐)'
  }[item.rarity];

  const rarityColor = {
    normal: '#5b2b2a',
    silver: '#6b7280',
    gold: '#d97706',
    iridium: '#9333ea'
  }[item.rarity];

  return (
    <div className="flex flex-col h-full bg-[#fce8c5] border-4 border-[#853605] p-4 text-[#3a1a06] shadow-md overflow-y-auto">
      {/* Top Header with Icon and Title */}
      <div className="flex items-start gap-3 pb-3 border-b-2 border-[#d68f54]">
        <div className="relative w-14 h-14 sdv-slot flex items-center justify-center shrink-0">
          <PixelIcon name={item.iconType} size={34} color={item.customColor} />
          <QualityStar rarity={item.rarity} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-wide text-[#3a1a06] leading-tight">
              {item.name}
            </h2>
            {item.version && (
              <span className="px-1.5 py-0.5 text-[10px] bg-[#d68f54] text-[#fff] font-mono rounded border border-[#853605]">
                v{item.version}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#853605] mt-0.5">{item.chineseName}</p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-bold" style={{ color: rarityColor }}>
              {rarityText}
            </span>
            <span className="text-[#853605] opacity-60">|</span>
            <span className="text-[#853605]">作者: {item.author}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="my-3">
        <p className="text-sm font-bold leading-relaxed text-[#4a2308] bg-[#fae0b2] p-2.5 rounded border border-[#d68f54]">
          {item.description}
        </p>
      </div>

      {/* Highlights / Features */}
      {item.highlights && item.highlights.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-[#853605] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>✨ 核心亮点 (Key Features)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {item.highlights.map((h, i) => (
              <div
                key={i}
                className="text-xs bg-[#f4d49e] px-2 py-1 border border-[#c98348] rounded flex items-center gap-1.5"
              >
                <span className="text-[#853605] font-bold">✔</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Long Description */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-[#853605] uppercase tracking-wider mb-1">
          📖 深度解析 (Deep Insight)
        </h4>
        <div className="text-xs leading-relaxed text-[#3a1a06] whitespace-pre-line bg-[#fbf0d9] p-2.5 rounded border border-[#d68f54]">
          {item.longDescription}
        </div>
      </div>

      {/* Installation Command */}
      {item.installCommand && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-[#853605] flex items-center gap-1">
              <Terminal size={14} /> 安装与使用指令
            </h4>
            <button
              onClick={() => handleCopy(item.installCommand!)}
              className="sdv-btn !py-0.5 !px-2 !text-[10px]"
              title="复制到剪贴板"
            >
              {copied ? <Check size={12} className="text-green-700" /> : <Copy size={12} />}
              {copied ? '已复制！' : '复制命令'}
            </button>
          </div>
          <pre className="text-xs font-mono bg-[#2b1d14] text-[#ffe4a1] p-2 rounded border border-[#5b2b2a] overflow-x-auto whitespace-pre-wrap break-all selection:bg-[#ffc376] selection:text-[#2b1d14]">
            <code>{item.installCommand}</code>
          </pre>
        </div>
      )}

      {/* Configuration Example */}
      {item.configExample && (
        <div className="mb-3">
          <h4 className="text-xs font-bold text-[#853605] mb-1">⚙ 配置示例 (cordis.yml)</h4>
          <pre className="text-xs font-mono bg-[#2b1d14] text-[#a8dadc] p-2 rounded border border-[#5b2b2a] overflow-x-auto whitespace-pre-wrap break-all">
            <code>{item.configExample}</code>
          </pre>
        </div>
      )}

      {/* Tips */}
      {item.tips && (
        <div className="mb-3 p-2 bg-[#ffe4a1] border-2 border-[#b14e05] rounded text-xs text-[#5b2b2a]">
          <span className="font-bold">💡 农场主秘笈: </span>
          {item.tips}
        </div>
      )}

      {/* Footer Tags & Links */}
      <div className="mt-auto pt-3 border-t-2 border-[#d68f54] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 bg-[#e4ae6e] text-[#5b2b2a] border border-[#853605] rounded"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {item.docId && onOpenDoc && (
            <button
              onClick={() => {
                retroAudio.playPageTurn();
                onOpenDoc(item.docId!);
              }}
              className="sdv-btn !py-1 !px-2.5 !text-xs !bg-[#ffe4a1]"
            >
              <BookOpen size={14} /> 阅读关联秘籍
            </button>
          )}

          {item.repoUrl && (
            <a
              href={item.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sdv-btn !py-1 !px-2.5 !text-xs"
              onClick={() => retroAudio.playSelect()}
            >
              <ExternalLink size={14} /> 源码仓库
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
