import React, { useMemo, useState } from 'react';
import { buildInventoryModel } from './config/loader';
import type { ItemView, SectionView } from './config/loader';
import { sectionLabel } from './theme/vocab';
import { InventoryGrid } from './components/InventoryGrid';
import { DetailPanel } from './components/DetailPanel';
import { BooksView } from './components/BooksView';
import { ItemIcon } from './components/ItemIcon';
import { retroAudio } from './audio/retroAudio';
import { Volume2, VolumeX, User, Backpack } from 'lucide-react';

export const App: React.FC = () => {
  const model = useMemo(() => buildInventoryModel(), []);
  const sections = model.sections;

  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id ?? '');
  const [subCategory, setSubCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(sections[0]?.items[0]?.id ?? null);
  const [selectedReaderId, setSelectedReaderId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [goldCount, setGoldCount] = useState(77777);
  const [showProfileModal, setShowProfileModal] = useState(false);

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

  const sectionCount = (id: string) => sections.find((s) => s.id === id)?.items.length ?? 0;
  const totalItemCount = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="min-h-screen lg:h-screen w-screen p-2 sm:p-4 max-w-6xl mx-auto flex flex-col justify-between overflow-x-hidden lg:overflow-hidden">
      {/* Top Banner / HUD Header */}
      <header className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#ecd0a6] border-2 border-[#4a2113] shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sdv-cell flex items-center justify-center bg-[#fff1d0]">
            <Backpack size={18} className="text-[#6e2e05]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-[#381503] flex items-center gap-1.5 leading-none">
              <span>{model.config.site.title}</span>
            </h1>
            {model.config.site.subtitle && (
              <p className="text-[10px] text-[#78350f] font-semibold mt-0.5">
                {model.config.site.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* HUD Widgets: Money, Sound, Profile */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {/* Gold Counter: Clean Retro Badge */}
          <div
            onClick={() => {
              retroAudio.playCoin();
              setGoldCount((g) => g + 500);
            }}
            className="flex items-center gap-1 bg-[#fff6e0] px-2 py-0.5 text-[#381503] cursor-pointer hover:bg-[#fff] border-b border-[#b45309] shadow-xs active:translate-y-0.5"
            title="点击收成金币！"
          >
            <span className="text-[#f59e0b] text-xs leading-none">🪙</span>
            <span className="font-mono text-xs leading-none text-[#78350f]">{goldCount.toLocaleString()}g</span>
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
                <span>{sectionLabel(sec)}</span>
                <span className="text-[10px] px-1 bg-[#4a2113]/20 rounded-none">{sec.items.length}</span>
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
      <footer className="mt-2 text-center text-[11px] text-[#ffe4a1] flex items-center justify-between gap-2 px-1 shrink-0">
        <span className="opacity-80">
          收纳总数: {totalItemCount} 项
        </span>
      </footer>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="sdv-menu-frame max-w-sm w-full p-4 text-[#381503] relative bg-[#fff6e0]">
            <button
              onClick={() => {
                retroAudio.playTab();
                setShowProfileModal(false);
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-[#ef4444] text-white font-bold flex items-center justify-center border border-[#4a2113] shadow-xs cursor-pointer hover:bg-[#dc2626]"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b-2 border-[#6e2e05] pb-3 mb-3">
              <div className="w-12 h-12 sdv-cell flex items-center justify-center bg-[#fff1d0]">
                <span className="text-2xl">👨‍🌾</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#4a2113]">农场主：John Ren</h3>
                <p className="text-xs text-[#78350f] font-semibold">全栈智能架构师 (Lv.10)</p>
                <p className="text-[10px] text-[#421c08]">农场：DSH Eco Farm</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="bg-[#ecd0a6] p-1.5 border border-[#6e2e05] flex justify-between">
                <span className="font-bold">宿主硬件:</span>
                <span>红米 K30S (骁龙 865)</span>
              </div>
              <div className="bg-[#ecd0a6] p-1.5 border border-[#6e2e05] flex justify-between">
                <span className="font-bold">环境形态:</span>
                <span>LineageOS 23.2 + chroot 24.04</span>
              </div>
              <div className="bg-[#ecd0a6] p-1.5 border border-[#6e2e05] flex justify-between">
                <span className="font-bold">自研插件:</span>
                <span>{sectionCount('plugins')} 个</span>
              </div>
              <div className="bg-[#ecd0a6] p-1.5 border border-[#6e2e05] flex justify-between">
                <span className="font-bold">全域技能:</span>
                <span>{sectionCount('skills')} 个</span>
              </div>
              <div className="bg-[#ecd0a6] p-1.5 border border-[#6e2e05] flex justify-between">
                <span className="font-bold">实战秘籍:</span>
                <span>{sectionCount('tomes')} 卷</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#6e2e05] text-center">
              <button
                onClick={() => {
                  retroAudio.playCoin();
                  setShowProfileModal(false);
                }}
                className="sdv-action-btn w-full !py-1.5"
              >
                收起档案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
