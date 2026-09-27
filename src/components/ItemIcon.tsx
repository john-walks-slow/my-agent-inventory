import React from 'react';
import type { IconRef } from '../config/loader';
import type { Rarity } from '../config/schema';
import { KIT_ASSET_URLS } from '../iconkit/assets';

interface ItemIconProps {
  iconRef: IconRef;
  size?: number;
  className?: string;
}

/** 兜底图腾：配置缺失/写错 id 时显示的问号木牌 */
const FallbackGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    className="shape-pixel opacity-70"
    style={{ imageRendering: 'pixelated' }}
  >
    <rect x="1" y="1" width="14" height="14" fill="var(--color-ui-fallback-dark)" />
    <rect x="2" y="2" width="12" height="12" fill="var(--color-ui-fallback-light)" />
    <rect x="7" y="4" width="2" height="2" fill="var(--color-ui-frame-border)" />
    <rect x="7" y="8" width="2" height="4" fill="var(--color-ui-frame-border)" />
  </svg>
);

/** 统一图腾渲染：custom-svg / custom-img / 内置套件 / 兜底 */
export const ItemIcon: React.FC<ItemIconProps> = ({ iconRef, size = 28, className = '' }) => {
  switch (iconRef.kind) {
    case 'custom-svg':
      return (
        <span
          className={`item-icon-svg shape-pixel transition-transform duration-75 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] inline-block leading-none ${className}`}
          style={{ width: size, height: size }}
          dangerouslySetInnerHTML={{ __html: iconRef.raw }}
        />
      );
    case 'custom-img':
      return (
        <img
          src={iconRef.url}
          alt={iconRef.name}
          width={size}
          height={size}
          className={`shape-pixel transition-transform duration-75 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] ${className}`}
          style={{ imageRendering: 'pixelated' }}
        />
      );
    case 'kit': {
      const url = KIT_ASSET_URLS[iconRef.id];
      if (!url) return <FallbackGlyph size={size} />;
      return (
        <img
          src={url}
          alt={iconRef.id}
          width={size}
          height={size}
          className={`shape-pixel transition-transform duration-75 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] ${className}`}
          style={{ imageRendering: 'pixelated' }}
        />
      );
    }
    default:
      return <FallbackGlyph size={size} />;
  }
};

// Authentic Stardew Valley Quality Star
export const PixelQualityBadge: React.FC<{ rarity: Rarity }> = ({ rarity }) => {
  if (rarity === 'normal') return null;

  const starColors = {
    silver: { fill: 'var(--color-quality-silver)', border: 'var(--color-quality-silver-edge)' },
    gold: { fill: 'var(--color-quality-gold)', border: 'var(--color-quality-gold-edge)' },
    iridium: { fill: 'var(--color-quality-iridium)', border: 'var(--color-quality-iridium-edge)' }
  }[rarity];

  return (
    <svg
      viewBox="0 0 8 8"
      width={12}
      height={12}
      className="absolute bottom-1 right-1 pointer-events-none drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 5-pointed pixel star */}
      <rect x="3" y="0" width="2" height="1" fill={starColors.border} />
      <rect x="2" y="1" width="4" height="1" fill={starColors.fill} />
      <rect x="0" y="2" width="8" height="2" fill={starColors.fill} />
      <rect x="1" y="4" width="6" height="2" fill={starColors.fill} />
      <rect x="1" y="6" width="2" height="2" fill={starColors.fill} />
      <rect x="5" y="6" width="2" height="2" fill={starColors.fill} />
      <rect x="3" y="4" width="2" height="2" fill={starColors.border} opacity="0.3" />
    </svg>
  );
};
