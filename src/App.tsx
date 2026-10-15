import React, { useEffect, useMemo, useState } from 'react';
import { buildInventoryModel } from './config/loader';
import type { ItemView, SectionView } from './config/loader';
import { THEMES } from './config/schema';
import type { ThemeId } from './config/schema';
import { sectionLabel, levelTitle, getVocab } from './theme/vocab';
import { InventoryGrid } from './components/InventoryGrid';
import { DetailPanel } from './components/DetailPanel';
import { BooksView } from './components/BooksView';
import { IconsCodex } from './components/IconsCodex';
import { BadgeView } from './components/BadgeView';
import { ItemIcon } from './components/ItemIcon';
import { HarnessProfileModal } from './components/HarnessProfileModal';
import { BrandAvatar } from './components/BrandAvatar';
import { retroAudio } from './audio/retroAudio';
import { Volume2, VolumeX, Palette } from 'lucide-react';

const THEME_NAMES: Record<ThemeId, string> = {
  stardew: '星露谷',
  pokemon: '宝可梦',
  jrpg: 'JRPG',
  diablo: '暗黑',
};

export const App: React.FC = () => {
  const model = useMemo(() => buildInventoryModel(), []);
  const sections = model.sections;
  const [theme, setTheme] = useState<ThemeId>(() => model.config.site.theme);
  const vocab = getVocab(theme);

  // hash 路由：#/icons → 图标图鉴
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 主题挂钩：theme → <html data-theme>（P5b 主题表按此切换 token 集 + 音色）
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    retroAudio.setTheme(theme);
  }, [theme]);

  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id ?? '');
  const [subCategory, setSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(sections[0]?.items[0]?.id ?? null);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [goldCount, setGoldCount] = useState(77777);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const profile = model.profile;

  const activeSection: SectionView | null = sections.find((s) => s.id === activeSectionId) ?? sections[0] ?? null;
  const isReaderView = activeSection?.view === 'reader';
  const currentItems: ItemView[] = isReaderView ? [] : (activeSection?.items ?? []);
  const selectedItem =
    currentItems.find((i) => i.id === selectedItemId) || currentItems[0] || null;

  const toggleSound = () => {
    retroAudio.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      retroAudio.playCoin();
    }
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    setTheme(nextTheme);
    retroAudio.setTheme(nextTheme);
    retroAudio.playTab();
  };

  const handleCategoryChange = (secId: string) => {
    retroAudio.playTab();
    setActiveSectionId(secId);
    setSubCategory('all');
    setSearchQuery('');
    const target = sections.find((s) => s.id === secId);
    if (target?.view === 'reader') {
      setSelectedReaderId(target.items[0]?.id ?? null);
    } else {
      setSelectedItemId(target?.items[0]?.id ?? null);
    }
  };

  // Subcategory filters（从 section.categories 派生）
  const subCategoryOptions = [
    { id: 'all', label: vocab.hud.allFilter },
    ...(activeSection?.categories ?? []).map((c) => ({ id: c.id, label: c.label }))
  ];

  const totalItemCount = sections.reduce((n, s) => n + s.items.length, 0);

  if (route === '#/icons') {
    return <IconsCodex onExit={() => { window.location.hash = ''; }} theme={theme} />;
  }

  if (route === '#/badge') {
    return <BadgeView onExit={() => { window.location.hash = ''; }} theme={theme} />;
  }

  return (
    <div className="min-h-screen lg:h-screen w-screen p-2 sm:p-4 max-w-6xl mx-auto flex flex-col justify-between overflow-x-hidden lg:overflow-hidden">
      {/* Top Banner / HUD Header：角色状态卡（点头像看档案） */}
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 bg-ui-panel border-2 border-ui-frame-border shadow-sm shrink-0">
        <button
          onClick={() => {
            retroAudio.playSelect();
            setShowProfileModal(true);
          }}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
          title={`${profile.info.nickname ?? profile.info.name} · ${vocab.hud.profile}`}
        >
          <div className="w-10 h-10 sdv-cell flex items-center justify-center bg-ui-cell-active shrink-0 group-hover:brightness-110">
            <BrandAvatar avatar={profile.avatar} size={34} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold tracking-wide text-ui-ink leading-none truncate font-display">
              {profile.info.nickname ?? profile.info.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold leading-none">
              <span className="bg-ui-frame-border text-ui-ink-gold px-1.5 py-0.5 font-mono">Lv.{profile.level.level}</span>
              <span className="text-ui-ink-muted truncate">{levelTitle(profile.level.level, theme)}</span>
              <span className="text-ui-ink-faint shrink-0">{Math.round(profile.level.progress * 100)}%</span>
            </div>
            <div className="h-1.5 bg-ui-exp-track border border-ui-wood-dark mt-1 max-w-44">
              <div className="h-full exp-bar-fill" style={{ width: `${Math.max(2, Math.round(profile.level.progress * 100))}%` }} />
            </div>
          </div>
        </button>

        {/* HUD Widgets: Money, Theme Switcher, Sound */}
        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          {/* Gold Counter: Clean Retro Badge */}
          <div
            onClick={() => {
              retroAudio.playCoin();
              setGoldCount((g) => g + 500);
            }}
            className="flex items-center gap-1 bg-ui-panel-light px-2 py-0.5 text-ui-ink cursor-pointer hover:bg-white border-b border-ui-ink-amber shadow-xs active:translate-y-0.5"
            title={vocab.hud.goldHint}
          >
            <span className="text-ui-gold-soft text-xs leading-none">{vocab.currency.glyph}</span>
            <span className="hidden sm:inline font-mono text-xs leading-none text-ui-ink-muted">{goldCount.toLocaleString()}{vocab.currency.unit}</span>
          </div>

          {/* Theme Switcher (Cycle through themes) */}
          <button
            onClick={cycleTheme}
            className="sdv-action-btn !p-1"
            title={`切换主题（当前: ${THEME_NAMES[theme]}，点击切换）`}
            aria-label={`切换主题（当前: ${THEME_NAMES[theme]}）`}
          >
            <Palette size={14} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="sdv-action-btn !p-1"
            title={soundEnabled ? '关闭 8-bit 音效' : '开启 8-bit 音效'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-red-700" />}
          </button>
        </div>
      </header>

      {/* Main Inventory Menu Frame */}
      <main className="sdv-menu-frame mt-6 p-3 sm:p-4 flex-1 flex flex-col relative min-h-0">
        {/* Top Category Tabs (Authentic Stardew Style - sits on the top border, horizontally scrollable on mobile) */}
        <div className="flex items-end gap-1.5 -mt-9 sm:-mt-10 mb-2 px-1 py-0.5 z-30 overflow-x-auto no-scrollbar shrink-0">
          {sections.map((sec) => {
            const isActive = activeSection?.id === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => handleCategoryChange(sec.id)}
                onMouseEnter={() => retroAudio.playHover()}
                className={`sdv-tab-btn px-3.5 py-1 text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                  isActive ? 'active' : ''
                }`}
              >
                <ItemIcon iconRef={sec.iconRef} size={14} />
                <span>{sectionLabel(sec, theme)}</span>
                <span className="text-[10px] px-1 bg-ui-frame-border/20 rounded-none">{sec.items.length}</span>
              </button>
            );
          })}
        </div>

        {/* Interior Container: Grid on Left (60%), Details on Right (40%) */}
        <div className="flex-1 min-h-0 flex flex-col lg:block">
          {isReaderView && activeSection ? (
            <BooksView
              section={activeSection}
              theme={theme}
              activeBookId={selectedReaderId}
              onSelectBook={(id) => setSelectedReaderId(id)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full">
              {/* Left Column: Backpack Grid (7 cols) */}
              <div className="lg:col-span-7 flex flex-col min-h-0 h-full">
                <InventoryGrid
                  items={currentItems}
                  selectedItem={selectedItem}
                  onSelectItem={(item) => setSelectedItemId(item.id)}
                  subCategory={subCategory}
                  onSelectSubCategory={setSubCategory}
                  subCategoryOptions={subCategoryOptions}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  totalSlots={Math.max(36, Math.ceil(currentItems.length / 12) * 12)}
                  theme={theme}
                />
              </div>

              {/* Right Column: Independent Scrollable Details Panel (5 cols) */}
              <div className="lg:col-span-5 h-[420px] lg:h-full min-h-0 mt-3 lg:mt-0">
                <DetailPanel item={selectedItem} theme={theme} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info HUD */}
      <footer className="mt-2 text-center text-[11px] text-ui-ink-gold flex items-center justify-between gap-2 px-1 shrink-0">
        <span className="opacity-80">
          {vocab.hud.totalLabel}: {totalItemCount} {vocab.hud.totalUnit}
        </span>
        <a
          href="https://github.com/john-walks-slow/my-agent-inventory"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => retroAudio.playTab()}
          className="inline-flex items-center gap-1 opacity-80 hover:opacity-100 underline underline-offset-2"
          title="Fork 本项目，创建你的 Agent 背包"
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>创建你的 Agent 背包</span>
        </a>
        <a
          href="#/icons"
          onClick={() => retroAudio.playTab()}
          className="opacity-80 hover:opacity-100 underline underline-offset-2"
          title="内置图标套件图鉴 · 7Soul (CC0)"
        >
          {vocab.hud.codexLink}
        </a>
      </footer>

      {/* Harness Profile Modal */}
      {showProfileModal && (
        <HarnessProfileModal
          profile={profile}
          sectionOrder={sections.map((s) => ({ id: s.id, label: s.label }))}
          theme={theme}
          onClose={() => {
            retroAudio.playTab();
            setShowProfileModal(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
