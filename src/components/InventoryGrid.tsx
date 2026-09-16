import React, { useState } from 'react';
import type { InventoryItem, SubCategory } from '../types/inventory';
import { PixelArtIcon, PixelQualityBadge } from './PixelArtIcon';
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
  totalSlots
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

  // Calculate dynamic capacity: base 36 slots, expands in increments of 12 (rows)
  const capacity = totalSlots || Math.max(36, Math.ceil(Math.max(items.length, filteredItems.length) / 12) * 12);

  // Build grid array with capacity slots
  const slots: (InventoryItem | null)[] = Array.from({ length: capacity }, (_, i) => {
    return filteredItems[i] || null;
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top Filter Bar: Subcategories (horizontal scroll) & Search Input */}
      <div className="flex items-center justify-between gap-1.5 mb-2 bg-[#ecd0a6] p-1.5 border-2 border-[#6e2e05] rounded-sm shadow-inner shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden no-scrollbar py-0.5 flex-1 min-w-0 mr-1">
          {subCategoryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                retroAudio.playTab();
                onSelectSubCategory(opt.id);
              }}
              className={`px-2 py-0.5 text-xs font-bold transition-all shrink-0 ${
                subCategory === opt.id
                  ? 'bg-[#fff1d0] text-[#381503] border border-[#6e2e05] shadow-[0_1px_0_#4a2113]'
                  : 'bg-[#d98236] text-[#fff] border border-[#6e2e05] hover:bg-[#e59349]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center shrink-0">
          <input
            type="text"
            placeholder="搜索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-24 sm:w-32 text-xs px-1.5 py-0.5 pl-5 bg-[#fff6e0] text-[#381503] placeholder-[#78350f]/60 border border-[#6e2e05] rounded-none focus:outline-none focus:bg-[#fff]"
          />
          <Search size={11} className="absolute left-1 text-[#78350f] pointer-events-none" />
        </div>
      </div>

      {/* Grid Container (Top-aligned, scrollable slots matrix) */}
      <div className="bg-[#f0c38e] border-2 border-[#6e2e05] p-2 sm:p-2.5 shadow-md flex flex-col flex-1 min-h-0 justify-between">
        <div className="overflow-y-auto custom-scroll pr-1 flex-1 min-h-0 max-h-[290px] sm:max-h-[350px] lg:max-h-none">
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-1.5 w-full">
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
                  className={`sdv-cell aspect-square w-full flex items-center justify-center cursor-pointer relative overflow-hidden ${
                    isSelected ? 'active' : ''
                  } ${!item ? 'opacity-80 cursor-default' : ''}`}
                  title={item ? `${item.name} (${item.chineseName})` : `空闲格子 [${idx + 1}]`}
                >
                  {/* Hotbar index badge for standard numeric keys 1-9, 0 */}
                  {idx < 10 && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] font-mono font-bold text-[#6e2e05]/60 pointer-events-none leading-none">
                      {(idx + 1) % 10}
                    </span>
                  )}

                  {item && (
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <PixelArtIcon name={item.iconType} size={28} className="max-w-full max-h-full" />
                      <PixelQualityBadge rarity={item.rarity} />
                      {item.stackSize && item.stackSize > 1 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-[#381503] font-mono bg-[#fff1d0]/90 px-0.5 leading-none rounded-none border border-[#6e2e05]/50 pointer-events-none">
                          {item.stackSize}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Capacity Status */}
        <div className="mt-2 pt-1.5 border-t border-[#6e2e05]/50 flex items-center justify-between text-[11px] text-[#421c08] font-bold px-0.5 shrink-0">
          <span>收纳数: {filteredItems.length} / {capacity}</span>
          <span className="text-[10px] text-[#78350f] opacity-80 font-normal">
            {capacity > 36 ? `(已扩容至 ${capacity / 12} 行 / ${capacity} 格)` : '豪华大背包 (36格)'}
          </span>
        </div>
      </div>

      {/* Item Quick Peek Bar (Fixed at top right below grid) */}
      <div className="mt-1.5 h-7 px-2 bg-[#fdf5df] border border-[#6e2e05] flex items-center justify-between text-xs text-[#381503] shadow-inner shrink-0">
        {hoveredItem ? (
          <>
            <div className="flex items-center gap-1.5 font-bold truncate">
              <span className="text-[#b45309]">{hoveredItem.name}</span>
              <span className="text-[#421c08] opacity-80">[{hoveredItem.chineseName}]</span>
            </div>
            <span className="text-[10px] text-[#b45309] shrink-0">点击查看属性</span>
          </>
        ) : (
          <span className="text-[10px] text-[#78350f]/70 italic">悬停在装备上可快速预览</span>
        )}
      </div>
    </div>
  );
};
