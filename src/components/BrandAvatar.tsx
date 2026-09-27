import React from 'react';

export interface BrandAvatarProps {
  avatar: { kind: 'custom-svg' | 'custom-img' | 'brand' | 'generic'; raw?: string; url?: string; key: string };
  size?: number;
  className?: string;
}

/** 品牌头像渲染：16×16 像素画放大（pixelated），带木框凹陷槽位 */
export const BrandAvatar: React.FC<BrandAvatarProps> = ({ avatar, size = 48, className = '' }) => {
  const glyph = avatar.raw ? (
    <span
      className="inline-block leading-none"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: avatar.raw }}
    />
  ) : (
    <img
      src={avatar.url}
      alt={avatar.key}
      width={size}
      height={size}
      style={{ imageRendering: 'pixelated' }}
      className="inline-block"
    />
  );

  return (
    <span
      className={`sdv-cell inline-flex items-center justify-center bg-[#fff1d0] shrink-0 ${className}`}
      style={{ width: size + 12, height: size + 12 }}
      title={avatar.key}
    >
      {glyph}
    </span>
  );
};
