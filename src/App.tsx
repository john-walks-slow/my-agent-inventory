import React, { useState } from 'react';
import type { CategoryId, SubCategory, InventoryItem } from './types/inventory';
import { PLUGINS_DATA, SKILLS_DATA, MCP_DATA, BOOKS_DATA } from './data/inventoryData';
import { InventoryGrid } from './components/InventoryGrid';
import { DetailPanel } from './components/DetailPanel';
import { BooksView } from './components/BooksView';
import { PixelIcon } from './components/PixelIcon';
import { retroAudio } from './audio/retroAudio';
import { Volume2, VolumeX, User, Backpack } from 'lucide-react';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('plugins');
  const [subCategory, setSubCategory] = useState<SubCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(PLUGINS_DATA[0].id);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [goldCount, setGoldCount] = useState(77777);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const toggleSound = () => {
    retroAudio.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      retroAudio.playCoin();
    }
  };

  const handleCategoryChange = (cat: CategoryId) => {
    retroAudio.playTab();
    setActiveCategory(cat);
    setSubCategory('all');
    setSearchQuery('');
    if (cat === 'plugins') {
      setSelectedItemId(PLUGINS_DATA[0]?.id || null);
    } else if (cat === 'skills') {
      setSelectedItemId(SKILLS_DATA[0]?.id || null);
    } else if (cat === 'mcp') {
      setSelectedItemId(MCP_DATA[0]?.id || null);
    } else if (cat === 'books') {
      setSelectedBookId(BOOKS_DATA[0]?.id || null);
    }
  };

  const handleOpenDoc = (docId: string) => {
    setActiveCategory('books');
    setSelectedBookId(docId);
  };

  // Get current dataset based on category
  const currentItems: InventoryItem[] = (() => {
    switch (activeCategory) {
      case 'plugins':
        return PLUGINS_DATA;
      case 'skills':
        return SKILLS_DATA;
      case 'mcp':
        return MCP_DATA;
      default:
        return [];
    }
  })();

  const selectedItem = currentItems.find((i) => i.id === selectedItemId) || currentItems[0] || null;

  // Subcategory filters
  const subCategoryOptions = (() => {
    switch (activeCategory) {
      case 'plugins':
        return [
          { id: 'all' as SubCategory, label: '全部插件' },
          { id: 'core' as SubCategory, label: '核心基石' },
          { id: 'tools' as SubCategory, label: '效能工具' },
          { id: 'workflow' as SubCategory, label: '高阶工作流' },
          { id: 'experiment' as SubCategory, label: '趣味实验' }
        ];
      case 'skills':
        return [
          { id: 'all' as SubCategory, label: '全部技能' },
          { id: 'ops' as SubCategory, label: '环境运维' },
          { id: 'workflow' as SubCategory, label: '交付流程' },
          { id: 'ai-core' as SubCategory, label: '核心AI机制' },
          { id: 'office' as SubCategory, label: '知识学习' },
          { id: 'multimodal' as SubCategory, label: '多模态生图' }
        ];
      case 'mcp':
        return [
          { id: 'all' as SubCategory, label: '全部MCP' },
          { id: 'search' as SubCategory, label: '搜索发现' },
          { id: 'research' as SubCategory, label: '深度调研' }
        ];
      default:
        return [{ id: 'all' as SubCategory, label: '全部' }];
    }
  })();

  const totalItemCount = PLUGINS_DATA.length + SKILLS_DATA.length + MCP_DATA.length + BOOKS_DATA.length;

  return (
    <div className="min-h-screen py-4 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Top Banner / HUD */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#d68f54] border-4 border-[#853605] px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sdv-slot flex items-center justify-center bg-[#ffe4a1]">
            <Backpack size={24} className="text-[#853605]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-[#3a1a06] flex items-center gap-2">
              <span>星露谷 DSH 装备背包</span>
              <span className="text-xs px-2 py-0.5 bg-[#ffe4a1] text-[#853605] border border-[#853605] rounded">
                Inventory v2.6
              </span>
            </h1>
            <p className="text-xs text-[#5b2b2a] font-semibold">
              个人开发的 DSH 插件、技能与实战避坑百科全书
            </p>
          </div>
        </div>

        {/* HUD Widgets: Money, Sound, Farmer Profile */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
          {/* Gold Counter */}
          <div
            onClick={() => {
              retroAudio.playCoin();
              setGoldCount((g) => g + 500);
            }}
            className="flex items-center gap-1.5 bg-[#e4ae6e] border-2 border-[#853605] px-2.5 py-1 text-[#3a1a06] cursor-pointer hover:bg-[#ffe4a1] shadow-inner"
            title="点击收成金币！"
          >
            <span className="text-[#ffcc00] drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] text-sm">💰</span>
            <span className="font-mono text-sm">{goldCount.toLocaleString()}g</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="sdv-btn !p-1.5"
            title={soundEnabled ? '关闭 8-bit 音效' : '开启 8-bit 音效'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-700" />}
          </button>

          {/* Farmer Profile Button */}
          <button
            onClick={() => {
              retroAudio.playSelect();
              setShowProfileModal(true);
            }}
            className="sdv-btn !py-1 !px-2.5"
          >
            <User size={14} /> 农场主档案
          </button>
        </div>
      </header>

      {/* Main Stardew Valley Menu Box */}
      <main className="sdv-box p-4 sm:p-6 flex-1 flex flex-col relative">
        {/* Top Category Tabs (Authentic Stardew Style) */}
        <div className="flex items-end gap-1.5 sm:gap-2 -mt-10 sm:-mt-12 mb-3 px-2 z-10 overflow-x-auto">
          {[
            { id: 'plugins', label: 'DSH 插件', icon: 'puzzle', count: PLUGINS_DATA.length },
            { id: 'skills', label: 'Agent 技能', icon: 'terminal', count: SKILLS_DATA.length },
            { id: 'mcp', label: 'MCP 服务器', icon: 'search', count: MCP_DATA.length },
            { id: 'books', label: '实战秘籍 (Books)', icon: 'book-open', count: BOOKS_DATA.length }
          ].map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id as CategoryId)}
                onMouseEnter={() => retroAudio.playHover()}
                className={`sdv-tab px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 ${
                  isActive ? 'active' : ''
                }`}
              >
                <PixelIcon name={tab.icon} size={16} color={isActive ? '#b14e05' : '#3a1a06'} />
                <span>{tab.label}</span>
                <span className="text-[10px] px-1 bg-[#853605]/20 rounded-full">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 mt-2">
          {activeCategory === 'books' ? (
            <BooksView
              books={BOOKS_DATA}
              activeBookId={selectedBookId}
              onSelectBook={(id) => setSelectedBookId(id)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
              {/* Left Column: Backpack Grid (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <InventoryGrid
                  items={currentItems}
                  selectedItem={selectedItem}
                  onSelectItem={(item) => setSelectedItemId(item.id)}
                  subCategory={subCategory}
                  onSelectSubCategory={setSubCategory}
                  subCategoryOptions={subCategoryOptions}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  totalSlots={36}
                />
              </div>

              {/* Right Column: Details Panel (5 cols) */}
              <div className="lg:col-span-5 h-[560px] lg:h-auto">
                <DetailPanel item={selectedItem} onOpenDoc={handleOpenDoc} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer info & easter egg */}
      <footer className="mt-4 text-center text-xs text-[#ffe4a1] flex flex-wrap items-center justify-between gap-2 px-2">
        <span className="opacity-80">
          🌾 致敬《星露谷物语》(ConcernedApe) • 纯手作像素调色板与复古 8-bit 声效
        </span>
        <div className="flex items-center gap-3">
          <span className="opacity-80">收纳总计: {totalItemCount} 项个人心血结晶</span>
          <span className="text-[#ffcc00]">星露谷农场：Pelican Town • Year 2</span>
        </div>
      </footer>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="sdv-box max-w-md w-full p-6 text-[#3a1a06] relative">
            <button
              onClick={() => {
                retroAudio.playTab();
                setShowProfileModal(false);
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-[#e63946] text-white font-bold flex items-center justify-center border-2 border-[#5b2b2a] shadow cursor-pointer hover:bg-[#d62828]"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 border-b-2 border-[#853605] pb-4 mb-4">
              <div className="w-16 h-16 sdv-slot flex items-center justify-center bg-[#ffe4a1]">
                <span className="text-3xl">👨‍🌾</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#4d2208]">农场主：John Ren</h3>
                <p className="text-xs text-[#853605] font-semibold">
                  称号：全栈智能架构师 (Level 10)
                </p>
                <p className="text-xs text-[#5b2b2a] mt-0.5">农场名称：DSH Eco Farm</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#e4ae6e] p-2 border border-[#853605] rounded flex justify-between">
                <span className="font-bold">装备设备:</span>
                <span>红米 K30S Ultra (Snapdragon 865)</span>
              </div>
              <div className="bg-[#e4ae6e] p-2 border border-[#853605] rounded flex justify-between">
                <span className="font-bold">操作系统:</span>
                <span>LineageOS 23.2 + chroot Ubuntu 24.04</span>
              </div>
              <div className="bg-[#e4ae6e] p-2 border border-[#853605] rounded flex justify-between">
                <span className="font-bold">已收纳自研插件:</span>
                <span>{PLUGINS_DATA.length} 个</span>
              </div>
              <div className="bg-[#e4ae6e] p-2 border border-[#853605] rounded flex justify-between">
                <span className="font-bold">全域 Agent 技能:</span>
                <span>{SKILLS_DATA.length} 个</span>
              </div>
              <div className="bg-[#e4ae6e] p-2 border border-[#853605] rounded flex justify-between">
                <span className="font-bold">精选踩坑秘籍:</span>
                <span>{BOOKS_DATA.length} 篇</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-[#853605] text-center">
              <button
                onClick={() => {
                  retroAudio.playCoin();
                  setShowProfileModal(false);
                }}
                className="sdv-btn w-full !py-2"
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
