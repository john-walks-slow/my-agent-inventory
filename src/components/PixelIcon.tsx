import React from 'react';
import {
  Hourglass,
  Sparkles,
  ShieldCheck,
  Zap,
  AlarmClock,
  Cpu,
  Database,
  Compass,
  Terminal,
  CheckCircle2,
  Puzzle,
  Globe,
  BookOpen,
  Palette,
  Search,
  BookMarked,
  Flame,
  ShieldAlert,
  Lock,
  Package,
  FileText
} from 'lucide-react';

interface PixelIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, className = '', size = 28, color }) => {
  const iconProps = {
    size,
    color,
    className: `${className} transition-transform duration-100 drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]`
  };

  switch (name) {
    case 'hourglass':
      return <Hourglass {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'shield-check':
      return <ShieldCheck {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'alarm-clock':
      return <AlarmClock {...iconProps} />;
    case 'cpu':
      return <Cpu {...iconProps} />;
    case 'database':
      return <Database {...iconProps} />;
    case 'compass':
      return <Compass {...iconProps} />;
    case 'terminal':
      return <Terminal {...iconProps} />;
    case 'check-circle-2':
      return <CheckCircle2 {...iconProps} />;
    case 'puzzle':
      return <Puzzle {...iconProps} />;
    case 'globe':
      return <Globe {...iconProps} />;
    case 'book-open':
      return <BookOpen {...iconProps} />;
    case 'palette':
      return <Palette {...iconProps} />;
    case 'search':
      return <Search {...iconProps} />;
    case 'book-marked':
      return <BookMarked {...iconProps} />;
    case 'flame':
      return <Flame {...iconProps} />;
    case 'shield-alert':
      return <ShieldAlert {...iconProps} />;
    case 'lock':
      return <Lock {...iconProps} />;
    case 'file-text':
      return <FileText {...iconProps} />;
    default:
      return <Package {...iconProps} />;
  }
};

export const QualityStar: React.FC<{ rarity: 'normal' | 'silver' | 'gold' | 'iridium' }> = ({ rarity }) => {
  if (rarity === 'normal') return null;

  let starColor = '#c0c0c0'; // silver
  let starShadow = '#707070';
  if (rarity === 'gold') {
    starColor = '#ffd700';
    starShadow = '#b8860b';
  } else if (rarity === 'iridium') {
    starColor = '#a855f7'; // purple
    starShadow = '#6b21a8';
  }

  return (
    <div
      className="absolute bottom-1 right-1 w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] pointer-events-none"
      style={{
        color: starColor,
        textShadow: `1px 1px 0px ${starShadow}, -1px -1px 0px ${starShadow}`
      }}
      title={`${rarity.toUpperCase()} Quality`}
    >
      ★
    </div>
  );
};
