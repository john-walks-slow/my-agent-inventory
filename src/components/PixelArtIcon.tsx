import React from 'react';

// Pixel art renderer using 16x16 SVG matrices
// Crisp, pixel-perfect retro game art with pure pixel coordinates

interface PixelArtIconProps {
  name: string;
  size?: number;
  className?: string;
  rarity?: 'normal' | 'silver' | 'gold' | 'iridium';
}

export const PixelArtIcon: React.FC<PixelArtIconProps> = ({
  name,
  size = 32,
  className = ''
}) => {
  // Render clean 16x16 crisp SVG pixel art
  const renderPixels = () => {
    switch (name) {
      // dsh-wait-subagent (Magic Hourglass / Chrono Shard)
      case 'hourglass':
        return (
          <g>
            {/* Wooden frame top & bottom */}
            <rect x="3" y="1" width="10" height="2" fill="#5b2b2a" />
            <rect x="4" y="2" width="8" height="1" fill="#853605" />
            <rect x="3" y="13" width="10" height="2" fill="#5b2b2a" />
            <rect x="4" y="13" width="8" height="1" fill="#853605" />
            {/* Glass bulb edges */}
            <rect x="4" y="3" width="8" height="1" fill="#c3d9ff" opacity="0.6" />
            <rect x="4" y="4" width="2" height="2" fill="#c3d9ff" opacity="0.8" />
            <rect x="10" y="4" width="2" height="2" fill="#c3d9ff" opacity="0.8" />
            <rect x="5" y="6" width="2" height="2" fill="#c3d9ff" opacity="0.8" />
            <rect x="9" y="6" width="2" height="2" fill="#c3d9ff" opacity="0.8" />
            <rect x="7" y="7" width="2" height="2" fill="#c3d9ff" />
            <rect x="5" y="8" width="2" height="2" fill="#c3d9ff" opacity="0.8" />
            <rect x="9" y="8" width="2" height="2" fill="#c3d9ff" opacity="0.8" />
            <rect x="4" y="10" width="2" height="3" fill="#c3d9ff" opacity="0.8" />
            <rect x="10" y="10" width="2" height="3" fill="#c3d9ff" opacity="0.8" />
            {/* Mystic Purple Sand / Crystal (Subagent Essence) */}
            <rect x="5" y="4" width="6" height="2" fill="#b388ff" />
            <rect x="6" y="5" width="4" height="1" fill="#7c4dff" />
            <rect x="7" y="7" width="2" height="2" fill="#e040fb" />
            <rect x="7" y="9" width="2" height="1" fill="#ea80fc" />
            <rect x="5" y="11" width="6" height="2" fill="#7c4dff" />
            <rect x="6" y="10" width="4" height="1" fill="#b388ff" />
            <rect x="7" y="11" width="2" height="1" fill="#ffd700" />
          </g>
        );

      // dsh-clear-mind (Prismatic Mind Shard / Crystal)
      case 'sparkles':
        return (
          <g>
            {/* Glowing crystal shard */}
            <polygon points="8,1 12,5 12,11 8,15 4,11 4,5" fill="#48cae4" />
            <polygon points="8,2 11,5 11,10 8,14" fill="#0077b6" />
            <polygon points="8,2 5,5 5,10 8,14" fill="#90e0ef" />
            <polygon points="8,3 9,5 9,9 8,11" fill="#ffffff" />
            {/* Sparkle glints */}
            <rect x="2" y="2" width="2" height="2" fill="#ffea00" />
            <rect x="12" y="3" width="1" height="1" fill="#ffffff" />
            <rect x="13" y="12" width="2" height="2" fill="#ffea00" />
            <rect x="1" y="10" width="1" height="1" fill="#ffffff" />
          </g>
        );

      // dsh-web-transport-trust (Golden Aegis / Key Shield)
      case 'shield-check':
        return (
          <g>
            <path d="M3 2 H13 V7 Q13 12 8 15 Q3 12 3 7 Z" fill="#2a9d8f" />
            <path d="M4 3 H12 V7 Q12 11 8 14 Q4 11 4 7 Z" fill="#e76f51" />
            <path d="M5 4 H11 V7 Q11 10 8 13 Q5 10 5 7 Z" fill="#f4a261" />
            {/* White/Gold Key glyph */}
            <rect x="7" y="5" width="2" height="3" fill="#ffe4a1" />
            <rect x="7" y="8" width="2" height="3" fill="#5b2b2a" />
            <rect x="9" y="9" width="1" height="1" fill="#5b2b2a" />
          </g>
        );

      // dsh-whip (Thunder Spark / Energy Tonic)
      case 'zap':
        return (
          <g>
            <polygon points="9,1 4,9 8,9 6,15 13,7 9,7" fill="#ffb703" />
            <polygon points="9,2 5,9 8,9 7,13 12,7 9,7" fill="#ffe066" />
            <polygon points="8,4 6,8 8,8 7,11 10,7 8,7" fill="#ffffff" />
            <rect x="1" y="4" width="2" height="1" fill="#ff5400" />
            <rect x="13" y="10" width="2" height="1" fill="#ff5400" />
          </g>
        );

      // dsh-proactive (Stardew Brass Pocket Clock)
      case 'alarm-clock':
        return (
          <g>
            {/* Bell caps */}
            <rect x="3" y="1" width="3" height="2" fill="#b14e05" />
            <rect x="10" y="1" width="3" height="2" fill="#b14e05" />
            {/* Clock body */}
            <circle cx="8" cy="9" r="6" fill="#853605" />
            <circle cx="8" cy="9" r="5" fill="#fce8c5" />
            <circle cx="8" cy="9" r="4" fill="#ffedd5" />
            {/* Hands */}
            <rect x="7" y="6" width="2" height="3" fill="#5b2b2a" />
            <rect x="8" y="8" width="3" height="1" fill="#5b2b2a" />
            {/* Feet */}
            <rect x="4" y="14" width="2" height="1" fill="#5b2b2a" />
            <rect x="10" y="14" width="2" height="1" fill="#5b2b2a" />
          </g>
        );

      // dsh-set-model (Iridescent Brain / Core CPU)
      case 'cpu':
        return (
          <g>
            {/* Gold pins */}
            <rect x="2" y="4" width="1" height="8" fill="#e9c46a" />
            <rect x="13" y="4" width="1" height="8" fill="#e9c46a" />
            <rect x="4" y="2" width="8" height="1" fill="#e9c46a" />
            <rect x="4" y="13" width="8" height="1" fill="#e9c46a" />
            {/* Green silicon chip */}
            <rect x="3" y="3" width="10" height="10" fill="#264653" />
            <rect x="4" y="4" width="8" height="8" fill="#2a9d8f" />
            {/* Crystal Core center */}
            <rect x="6" y="6" width="4" height="4" fill="#e76f51" />
            <rect x="7" y="7" width="2" height="2" fill="#ffe4a1" />
          </g>
        );

      // dsh-mini-memory (Memory Floppy / Ancient Scroll)
      case 'database':
        return (
          <g>
            {/* Floppy disc body */}
            <rect x="3" y="2" width="10" height="12" fill="#3a86ff" rx="1" />
            <rect x="4" y="3" width="8" height="10" fill="#1d3557" />
            {/* Metal slider */}
            <rect x="5" y="2" width="6" height="5" fill="#e2e8f0" />
            <rect x="6" y="3" width="2" height="3" fill="#1d3557" />
            {/* Label */}
            <rect x="5" y="8" width="6" height="4" fill="#fefae0" />
            <rect x="6" y="9" width="4" height="1" fill="#853605" />
            <rect x="6" y="10" width="3" height="1" fill="#853605" />
          </g>
        );

      // dsh-simulated-life (Pixel Sprout / Life Seed)
      case 'compass':
        return (
          <g>
            {/* Soil mound */}
            <ellipse cx="8" cy="13" rx="5" ry="2" fill="#853605" />
            <ellipse cx="8" cy="13" rx="4" ry="1" fill="#5b2b2a" />
            {/* Sprout stem */}
            <rect x="7" y="7" width="2" height="6" fill="#38b000" />
            {/* Twin Leaves */}
            <path d="M7 8 Q4 6 3 9 Q6 10 7 8 Z" fill="#70e000" />
            <path d="M9 7 Q12 5 13 8 Q10 9 9 7 Z" fill="#70e000" />
            {/* Magic Dewdrop */}
            <circle cx="8" cy="6" r="1.5" fill="#48cae4" />
          </g>
        );

      // container-ops (Ancient Dwarven Terminal / Rune Box)
      case 'terminal':
        return (
          <g>
            <rect x="2" y="2" width="12" height="12" fill="#5b2b2a" rx="1" />
            <rect x="3" y="3" width="10" height="9" fill="#1b263b" />
            {/* Terminal prompt cursor >_ in phosphor amber */}
            <text x="4" y="8" fill="#52b788" fontSize="5" fontFamily="monospace" fontWeight="bold">&gt;</text>
            <rect x="8" y="5" width="3" height="1" fill="#52b788" />
            <rect x="4" y="9" width="5" height="1" fill="#74c69d" />
            {/* Stand */}
            <rect x="6" y="12" width="4" height="2" fill="#853605" />
          </g>
        );

      // workflow-implement-review (Golden Laurel / Seal of Quality)
      case 'check-circle-2':
        return (
          <g>
            <circle cx="8" cy="8" r="6" fill="#853605" />
            <circle cx="8" cy="8" r="5" fill="#ffd166" />
            <circle cx="8" cy="8" r="4" fill="#ffb703" />
            {/* Bold Green Checkmark */}
            <path d="M5 8 L7 10 L11 6" stroke="#065f46" strokeWidth="1.8" fill="none" strokeLinecap="square" />
          </g>
        );

      // dev-dsh-plugin (Stardew Puzzle Tile)
      case 'puzzle':
        return (
          <g>
            <rect x="3" y="4" width="8" height="8" fill="#8338ec" />
            <circle cx="7" cy="3" r="2" fill="#8338ec" />
            <circle cx="12" cy="8" r="2" fill="#8338ec" />
            <circle cx="7" cy="11" r="1.5" fill="#3a1a06" opacity="0.3" />
            <rect x="4" y="5" width="6" height="6" fill="#9d4edd" />
            <rect x="5" y="6" width="2" height="2" fill="#e0aaff" />
          </g>
        );

      // camoufox-cli (Ninja Fox / Stealth Mask)
      case 'globe':
        return (
          <g>
            {/* Fox Mask */}
            <polygon points="3,3 6,7 4,9 8,14 12,9 10,7 13,3 8,6" fill="#fb5607" />
            <polygon points="4,4 6,7 5,8 8,13 11,8 10,7 12,4 8,6" fill="#ff7b00" />
            <rect x="5" y="7" width="2" height="2" fill="#2b1d14" />
            <rect x="9" y="7" width="2" height="2" fill="#2b1d14" />
            <circle cx="8" cy="11" r="1" fill="#2b1d14" />
          </g>
        );

      // code-deep-dive (Golden Tome of Wisdom)
      case 'book-open':
        return (
          <g>
            {/* Open Book Wings */}
            <path d="M2 5 Q5 4 8 6 Q11 4 14 5 L14 13 Q11 12 8 13 Q5 12 2 13 Z" fill="#853605" />
            <path d="M3 6 Q5 5 8 7 L8 12 Q5 11 3 12 Z" fill="#fff1d0" />
            <path d="M13 6 Q11 5 8 7 L8 12 Q11 11 13 12 Z" fill="#fff1d0" />
            {/* Script lines */}
            <line x1="4" y1="8" x2="7" y2="8.5" stroke="#916132" strokeWidth="0.8" />
            <line x1="4" y1="10" x2="7" y2="10.5" stroke="#916132" strokeWidth="0.8" />
            <line x1="9" y1="8.5" x2="12" y2="8" stroke="#916132" strokeWidth="0.8" />
            <line x1="9" y1="10.5" x2="12" y2="10" stroke="#916132" strokeWidth="0.8" />
            {/* Red Bookmark Ribbon */}
            <polygon points="7,5 9,5 8.5,8 8,7.5 7.5,8" fill="#e63946" />
          </g>
        );

      // seedream-imagegen (Artist Palette)
      case 'palette':
        return (
          <g>
            <path d="M8 2 C4 2 2 5 2 9 C2 13 6 14 9 14 C11 14 13 13 13 11 C13 9.5 11.5 9 11.5 8 C11.5 7 13 6 12 3 C11 2 9.5 2 8 2 Z" fill="#f4a261" />
            {/* Color dabs */}
            <circle cx="5" cy="5" r="1" fill="#e63946" />
            <circle cx="8" cy="4" r="1" fill="#3a86ff" />
            <circle cx="10" cy="6" r="1" fill="#ffb703" />
            <circle cx="5" cy="9" r="1" fill="#52b788" />
            {/* Thumbhole */}
            <circle cx="9" cy="11" r="1.2" fill="#853605" />
          </g>
        );

      // mcp-degoog (Crystal Spyglass / Lens)
      case 'search':
        return (
          <g>
            <circle cx="7" cy="7" r="4.5" fill="#853605" />
            <circle cx="7" cy="7" r="3.5" fill="#48cae4" />
            <circle cx="7" cy="7" r="2.5" fill="#90e0ef" />
            <rect x="6" y="5" width="2" height="1" fill="#ffffff" />
            {/* Handle */}
            <line x1="10" y1="10" x2="14" y2="14" stroke="#853605" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="10" y1="10" x2="14" y2="14" stroke="#d68f54" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        );

      // mcp-exa (Prismatic Star Map)
      case 'book-marked':
        return (
          <g>
            <rect x="3" y="2" width="10" height="12" fill="#5b2b2a" rx="1" />
            <rect x="4" y="3" width="8" height="10" fill="#7209b7" />
            {/* Golden Bookmark Hanging */}
            <path d="M7 1 L9 1 L9 8 L8 7 L7 8 Z" fill="#ffd166" />
            {/* Star embossing */}
            <circle cx="8" cy="10" r="1" fill="#f72585" />
          </g>
        );

      // flame (Orphan Process Burning Flame)
      case 'flame':
        return (
          <g>
            <path d="M8 2 Q11 6 12 9 Q13 13 8 15 Q3 13 4 9 Q6 6 8 2 Z" fill="#d00000" />
            <path d="M8 5 Q10 8 10 10 Q11 13 8 14 Q5 13 6 10 Q7 8 8 5 Z" fill="#ff6000" />
            <path d="M8 9 Q9 11 9 12 Q9 14 8 14 Q7 14 7 12 Q7 11 8 9 Z" fill="#ffea00" />
          </g>
        );

      // default ancient bag
      default:
        return (
          <g>
            <rect x="3" y="4" width="10" height="10" fill="#853605" rx="1" />
            <rect x="4" y="5" width="8" height="8" fill="#d68f54" />
            <rect x="6" y="2" width="4" height="3" fill="#5b2b2a" />
            <rect x="7" y="7" width="2" height="2" fill="#ffc376" />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={`shape-pixel transition-transform duration-75 drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {renderPixels()}
    </svg>
  );
};

// Authentic Stardew Valley Quality Star
export const PixelQualityBadge: React.FC<{ rarity: 'normal' | 'silver' | 'gold' | 'iridium' }> = ({ rarity }) => {
  if (rarity === 'normal') return null;

  const starColors = {
    silver: { fill: '#e2e8f0', border: '#64748b' },
    gold: { fill: '#fbbf24', border: '#b45309' },
    iridium: { fill: '#c084fc', border: '#6b21a8' }
  }[rarity];

  return (
    <svg
      viewBox="0 0 8 8"
      width={12}
      height={12}
      className="absolute bottom-0.5 right-0.5 pointer-events-none drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]"
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
