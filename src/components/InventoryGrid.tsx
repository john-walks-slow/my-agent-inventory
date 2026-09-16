import React, { useState } from 'react';
import type { InventoryItem, SubCategory } from '../types/inventory';
import { PixelIcon, QualityStar } from './PixelIcon';
import { retroAudio } from '../audio/retroAudio';
import { Search } from 'lucide-react';

interface InventoryGridProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem) => void;
  subCategory: SubCategory;
  onSelectSubCategory: (sub: SubCategory) => void;
  subCategoryOptions: { id: SubCategory; label: string }[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalSlots?: number;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  selectedItem,
  onSelectItem,
  subCategory,
  onSelectSubCategory,
  subCategoryOptions,
  searchQuery,
  onSearchChange,
  totalSlots = 36 // 3 rows of 12 (standard Stardew upgraded pack)
}) => {
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSub = subCategory === 'all' || item.subCategory === subCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chineseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSub && matchesSearch;
  });

  // Build 36-slot fixed grid array
  const slots: (InventoryItem | null)[] = Array.from({ length: totalSlots }, (_, i) => {
    return filteredItems[i] || null;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Subcategory Filter Pills and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#e4ae6e] p-2 border-2 border-[#853605] rounded-sm">
        <div className="flex flex-wrap gap-1">
          {subCategoryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                retroAudio.playTab();
                onSelectSubCategory(opt.id);
              }}
              className={`px-2.5 py-1 text-xs font-bold transition-all ${
                subCategory === opt.id
                  ? 'bg-[#ffe4a1] text-[#5b2b2a] border-2 border-[#853605] shadow-[0_2px_0_#5b2b2a]'
                  : 'bg-[#d68f54] text-[#3a1a06] border border-[#853605] hover:bg-[#eba867]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="搜索物品/标签..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-40 sm:w-48 text-xs px-2 py-1 pl-6 bg-[#ffc376] text-[#3a1a06] placeholder-[#853605]/70 border-2 border-[#853605] rounded-none focus:outline-none focus:bg-[#ffe4a1]"
          />
          <Search size={12} className="absolute left-2 text-[#853605] pointer-events-none" />
        </div>
      </div>

      {/* Grid Container (12 columns per row in Stardew style) */}
      <div className="bg-[#d68f54] border-4 border-[#853605] p-3 shadow-md">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 sm:gap-2">
          {slots.map((item, idx) => {
            const isSelected = selectedItem?.id === item?.id;
            return (
              <div
                key={idx}
                onMouseEnter={() => {
                  if (item) {
                    retroAudio.playHover();
                    setHoveredItem(item);
                  }
                }}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                  if (item) {
                    retroAudio.playSelect();
                    onSelectItem(item);
                  }
                }}
                className={`sdv-slot aspect-square flex items-center justify-center cursor-pointer transition-all ${
                  item ? 'hover:scale-105 active:scale-95' : 'cursor-default opacity-85'
                } ${isSelected ? 'active' : ''}`}
                title={item ? `${item.name} (${item.chineseName})` : `空闲格子 [${idx + 1}]`}
              >
                {/* Hotbar index badge for first row */}
                {idx < 12 && (
                  <span className="absolute top-0.5 left-1 text-[9px] font-mono font-bold text-[#853605]/50 pointer-events-none">
                    {(idx + 1) % 10}
                  </span>
                )}

                {item && (
                  <>
                    <PixelIcon name={item.iconType} size={26} color={item.customColor} />
                    <QualityStar rarity={item.rarity} />
                    {item.stackSize && item.stackSize > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-[#3a1a06] font-mono bg-[#ffe4a1]/80 px-0.5 rounded pointer-events-none">
                        {item.stackSize}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Backpack Capacity Status Footer */}
        <div className="mt-2.5 pt-2 border-t-2 border-[#853605] flex items-center justify-between text-[11px] text-[#5b2b2a] font-bold px-1">
          <span>
            已收纳: {filteredItems.length} / {totalSlots} 件装备
          </span>
          <span className="text-[#853605]">🎒 豪华背包 (36 格已全解锁)</span>
        </div>
      </div>

      {/* Floating Mini Hover Tooltip Preview */}
      {hoveredItem && (
        <div className="mt-2 p-2 bg-[#ffe4a1] border-2 border-[#853605] text-[#3a1a06] text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#853605]">{hoveredItem.name}</span>
            <span className="opacity-75">[{hoveredItem.chineseName}]</span>
          </div>
          <span className="text-[10px] font-bold text-[#b14e05]">点击查看详细属性 ➔</span>
        </div>
      )}
    </div>
  );
};
