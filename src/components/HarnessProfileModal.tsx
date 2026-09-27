import React from 'react';
import type { HarnessProfileView } from '../config/loader';
import { BrandAvatar } from './BrandAvatar';
import { levelTitle, sectionLabel } from '../theme/vocab';
import { computeExp } from '../stats/level';
import { retroAudio } from '../audio/retroAudio';

/** 中文单位格式化 Token：4356590671 → 43.6 亿 */
function fmtTokens(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)} 亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)} 万`;
  return n.toLocaleString('zh-CN');
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="bg-ui-panel p-1.5 border border-ui-wood-dark flex justify-between gap-2">
    <span className="font-bold shrink-0">{label}</span>
    <span className="text-right">{children}</span>
  </div>
);

export interface HarnessProfileModalProps {
  profile: HarnessProfileView;
  sectionOrder: Array<{ id: string; label?: string }>;
  onClose: () => void;
}

/** Harness 档案弹窗：品牌头像 + 昵称 + Lv/EXP + 统计数据行 */
export const HarnessProfileModal: React.FC<HarnessProfileModalProps> = ({ profile, sectionOrder, onClose }) => {
  const { info, avatar, stats, level, gear } = profile;
  const title = levelTitle(level.level);
  const expPct = Math.round(level.progress * 100);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="sdv-menu-frame max-w-sm w-full p-4 text-ui-ink relative bg-ui-panel-light"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-ui-danger text-white font-bold flex items-center justify-center border border-ui-frame-border shadow-xs cursor-pointer hover:bg-ui-danger-dark"
        >
          ✕
        </button>

        {/* 头部：头像 + 昵称 + 等级 */}
        <div className="flex items-center gap-3 border-b-2 border-ui-wood-dark pb-3 mb-3">
          <BrandAvatar avatar={avatar} size={48} />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-ui-frame-border leading-tight">
              {info.nickname ?? info.name}
            </h3>
            <p className="text-xs text-ui-ink-muted font-semibold mt-0.5">
              {info.name}
              {info.version ? ` · v${info.version}` : ''}
            </p>
            <p className="text-[11px] mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="bg-ui-frame-border text-ui-ink-gold px-1.5 py-px font-bold">Lv.{level.level}</span>
              <span className="font-bold text-ui-ink-muted">{title}</span>
            </p>
          </div>
        </div>

        {/* EXP 经验条 */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-bold text-ui-ink-muted mb-1">
            <span>EXP</span>
            <span>{level.maxed ? 'MAX' : `距 Lv.${level.level + 1} 还差 ${100 - expPct}%`}</span>
          </div>
          <div className="h-4 bg-ui-exp-track border-2 border-ui-wood-dark p-px box-border">
            <div
              className="h-full exp-bar-fill"
              style={{ width: `${Math.max(2, expPct)}%` }}
            />
          </div>
        </div>

        {/* 统计数据行 */}
        <div className="space-y-1.5 text-xs">
          {info.since && (
            <Row label="入坑日期:">
              {info.since}
              {stats.days > 0 && <span className="opacity-70">（{stats.days} 天）</span>}
            </Row>
          )}
          {stats.sessions !== undefined && <Row label="主会话:">{stats.sessions.toLocaleString('zh-CN')} 场</Row>}
          {stats.subagentSessions !== undefined && (
            <Row label="分身会话:">
              {stats.subagentSessions.toLocaleString('zh-CN')} 场
              <span className="opacity-70">（子代理）</span>
            </Row>
          )}
          {stats.tokens !== undefined && <Row label="累计 Token:">{fmtTokens(stats.tokens)}<span className="opacity-70">（非缓存）</span></Row>}
          {stats.cacheTokens !== undefined && <Row label="缓存命中:">{fmtTokens(stats.cacheTokens)}</Row>}
          <Row label="背包装载:">
            <span className="inline-flex flex-wrap gap-x-2 justify-end">
              {sectionOrder.map((sec) => (
                <span key={sec.id}>
                  {sectionLabel(sec)} {gear[sec.id] ?? 0}
                </span>
              ))}
            </span>
          </Row>
        </div>

        {/* EXP 构成彩蛋（geeks 的浪漫） */}
        <p className="mt-3 text-[10px] text-ui-ink-faint leading-relaxed">
          EXP = 会话 {computeExp({ sessions: stats.sessions }).toFixed(1)} + Token{' '}
          {computeExp({ tokens: stats.tokens }).toFixed(1)} + 工龄 {computeExp({ days: stats.days }).toFixed(1)} +
          装备 {computeExp({ gear }).toFixed(1)} = {level.exp.toFixed(1)}
        </p>

        <div className="mt-2 pt-2 border-t border-ui-wood-dark text-center">
          <button
            onClick={() => {
              retroAudio.playCoin();
              onClose();
            }}
            className="sdv-action-btn w-full !py-1.5"
          >
            收起档案
          </button>
        </div>
      </div>
    </div>
  );
};
