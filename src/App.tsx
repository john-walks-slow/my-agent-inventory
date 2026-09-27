import React, { useEffect, useMemo, useState } from 'react';
import { buildInventoryModel } from './config/loader';
import type { ItemView, SectionView } from './config/loader';
import { sectionLabel, levelTitle, getVocab } from './theme/vocab';
import { InventoryGrid } from './components/InventoryGrid';
import { DetailPanel } from './components/DetailPanel';
import { BooksView } from './components/BooksView';
import { IconsCodex } from './components/IconsCodex';
import { ItemIcon } from './components/ItemIcon';
import { HarnessProfileModal } from './components/HarnessProfileModal';
import { retroAudio } from './audio/retroAudio';
import { Volume2, VolumeX, User, Backpack } from 'lucide-react';

export const App: React.FC = () => {
  const model = useMemo(() => buildInventoryModel(), []);
  const sections = model.sections;
  const theme = model.config.site.theme;
  const vocab = getVocab(theme);

  // hash 路由：#/icons → 图标图鉴
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 主题挂钩：site.theme → <html data-theme>（P5b 主题表按此切换 token 集 + 音色）
  useEffect(() => {
    document.documentElement.dataset.theme = model.config.site.theme;
    retroAudio.setTheme(model.config.site.theme);
  }, [model.config.site.theme]);

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
    { id: 'all', label: '全部' },
    ...(activeSection?.categories ?? []).map((c) => ({ id: c.id, label: c.label }))
  ];

  const totalItemCount = sections.reduce((n, s) => n + s.items.length, 0);

  if (route === '#/icons') {
    return <IconsCodex onExit={() => { window.location.hash = ''; }} />;
  }

  return (
    <div className="min-h-screen lg:h-screen w-screen p-2 sm:p-4 max-w-6xl mx-auto flex flex-col justify-between overflow-x-hidden lg:overflow-hidden">
      {/* Top Banner / HUD Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 bg-ui-panel border-2 border-ui-frame-border shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sdv-cell flex items-center justify-center bg-ui-cell-active">
            <Backpack size={18} className="text-ui-wood-dark" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-ui-ink flex items-center gap-1.5 leading-none">
              <span>{model.config.site.title}</span>
            </h1>
            {model.config.site.subtitle && (
              <p className="text-[10px] text-ui-ink-muted font-semibold mt-0.5">
                {model.config.site.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* HUD Widgets: Level, Money, Sound, Profile */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {/* Level Badge: opens harness profile */}
          <button
            onClick={() => {
              retroAudio.playSelect();
              setShowProfileModal(true);
            }}
            className="flex items-center gap-1 bg-ui-frame-border px-2 py-0.5 text-ui-ink-gold cursor-pointer hover:bg-ui-wood-dark border-b border-ui-shadow-deep shadow-xs active:translate-y-0.5"
            title={`${profile.info.name} 档案`}
          >
            <span className="text-ui-gold leading-none">★</span>
            <span className="font-mono text-xs leading-none">Lv.{profile.level.level}</span>
            <span className="hidden sm:inline text-[10px] opacity-90">{levelTitle(profile.level.level, theme)}</span>
          </button>

          {/* Gold Counter: Clean Retro Badge */}
          <div
            onClick={() => {
              retroAudio.playCoin();
              setGoldCount((g) => g + 500);
            }}
            className="flex items-center gap-1 bg-ui-panel-light px-2 py-0.5 text-ui-ink cursor-pointer hover:bg-white border-b border-ui-ink-amber shadow-xs active:translate-y-0.5"
            title="点击收成金币！"
          >
            <span className="text-ui-gold-soft text-xs leading-none">{vocab.currency.glyph}</span>
            <span className="font-mono text-xs leading-none text-ui-ink-muted">{goldCount.toLocaleString()}{vocab.currency.unit}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="sdv-action-btn !p-1"
            title={soundEnabled ? '关闭 8-bit 音效' : '开启 8-bit 音效'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} className="text-red-700" />}
          </button>

          {/* Farmer Profile Button */}
          <button
            onClick={() => {
              retroAudio.playSelect();
              setShowProfileModal(true);
            }}
            className="sdv-action-btn !py-0.5 !px-2 text-xs"
          >
            <User size={12} /> 档案
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
                <DetailPanel item={selectedItem} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info HUD */}
      <footer className="mt-2 text-center text-[11px] text-ui-ink-gold flex items-center justify-between gap-2 px-1 shrink-0">
        <span className="opacity-80">
          收纳总数: {totalItemCount} 项
        </span>
        <a
          href="#/icons"
          onClick={() => retroAudio.playTab()}
          className="opacity-80 hover:opacity-100 underline underline-offset-2"
          title="内置图标套件图鉴"
        >
          图标图鉴 · 7Soul (CC0)
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
