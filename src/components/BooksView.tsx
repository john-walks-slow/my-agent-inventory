import React, { useState, useMemo } from 'react';
import type { SectionView, ItemView } from '../config/loader';
import { ItemIcon, PixelQualityBadge } from './ItemIcon';
import { retroAudio } from '../audio/retroAudio';
import { marked } from 'marked';
import { BookOpen, Bookmark } from 'lucide-react';

interface BooksViewProps {
  section: SectionView;
  activeBookId?: string | null;
  onSelectBook?: (id: string | null) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  section,
  activeBookId,
  onSelectBook
}) => {
  const books = section.items;
  const [selectedSub, setSelectedSub] = useState<string>('all');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    activeBookId || books[0]?.id || null
  );

  const currentBookId = activeBookId !== undefined ? activeBookId : internalSelectedId;
  const currentBook: ItemView | null = books.find((b) => b.id === currentBookId) || null;

  const categoryLabel = (id?: string) =>
    section.categories?.find((c) => c.id === id)?.label ?? '';

  const handleBookClick = (id: string) => {
    retroAudio.playPageTurn();
    if (onSelectBook) {
      onSelectBook(id);
    } else {
      setInternalSelectedId(id);
    }
  };

  const filteredBooks = books.filter((b) => {
    if (selectedSub === 'all') return true;
    return b.category === selectedSub;
  });

  const currentContent = currentBook?.content;
  const renderedContent = useMemo(() => {
    if (!currentContent) return '';
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    return marked.parse(currentContent) as string;
  }, [currentContent]);

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full overflow-hidden">
      {/* Left Bookshelf Column */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col h-full">
        {/* Subcategory Filter Pills */}
        {section.categories && section.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 bg-[#ecd0a6] p-1.5 border-2 border-[#6e2e05] rounded-sm mb-2 shrink-0 shadow-inner">
            {[{ id: 'all', label: '全部' }, ...section.categories].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  retroAudio.playTab();
                  setSelectedSub(tab.id);
                }}
                className={`px-1.5 py-0.5 text-xs font-bold transition-all ${
                  selectedSub === tab.id
                    ? 'bg-[#fff1d0] text-[#381503] border border-[#6e2e05]'
                    : 'bg-[#d98236] text-[#fff] border border-[#6e2e05] hover:bg-[#e59349]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Bookshelf Spine List */}
        <div className="custom-scroll flex-1 bg-[#f0c38e] border-2 border-[#6e2e05] p-2 space-y-1.5 overflow-y-auto shadow-md">
          {filteredBooks.map((book) => {
            const isSelected = book.id === currentBookId;
            return (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.id)}
                onMouseEnter={() => retroAudio.playHover()}
                className={`p-2 border cursor-pointer transition-all flex gap-2 items-start ${
                  isSelected
                    ? 'bg-[#fff6e0] border-[#6e2e05] translate-x-1 shadow-[2px_2px_0_#4a2113]'
                    : 'bg-[#ecd0a6] border-[#6e2e05]/60 hover:bg-[#fdf5df]'
                }`}
              >
                <div className="relative w-8 h-8 sdv-cell flex items-center justify-center shrink-0 mt-0.5">
                  <ItemIcon iconRef={book.iconRef} size={22} />
                  <PixelQualityBadge rarity={book.rarity} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[#381503] line-clamp-2 leading-tight">
                    {book.name}
                  </h3>
                  {book.description && (
                    <p className="text-[10px] text-[#78350f] line-clamp-1 mt-0.5">
                      {book.description}
                    </p>
                  )}
                  {book.category && (
                    <span className="inline-block mt-1 text-[9px] px-1 py-0.2 bg-[#fdecd2] text-[#421c08] border border-[#8d562b]/50 font-bold">
                      {categoryLabel(book.category)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Parchment Reader Column */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        {currentBook ? (
          <div className="sdv-parchment-sheet p-4 sm:p-6 flex-1 flex flex-col h-full overflow-hidden text-[#381503]">
            {/* Header Bookmark */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#8d562b]/40 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8d562b]">
                <Bookmark size={14} />
                <span>秘籍阁 • {currentBook.title ?? currentBook.name}</span>
              </div>
              <div className="text-[11px] font-bold text-[#78350f] flex items-center gap-2">
                {currentBook.category && <span>{categoryLabel(currentBook.category)}</span>}
                {currentBook.added && (
                  <>
                    <span>•</span>
                    <span>{currentBook.added}</span>
                  </>
                )}
              </div>
            </div>

            {/* Independent Scrollable Markdown Body */}
            <div
              className="custom-scroll flex-1 overflow-y-auto pr-2 prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed space-y-2 select-text
                [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-[#4a2113] [&_h1]:border-b [&_h1]:border-[#8d562b]/50 [&_h1]:pb-1.5
                [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-[#6e2e05] [&_h2]:mt-3
                [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-[#b45309]
                [&_p]:leading-relaxed [&_p]:text-[#381503]
                [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                [&_pre]:bg-[#22160d] [&_pre]:text-[#ffe4a1] [&_pre]:p-2.5 [&_pre]:border [&_pre]:border-[#6e2e05] [&_pre]:overflow-x-auto
                [&_code]:font-mono [&_code]:text-xs
                [&_blockquote]:border-l-3 [&_blockquote]:border-[#8d562b] [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_blockquote]:text-[#6e2e05]
                [&_table]:w-full [&_table]:text-xs
                [&_th]:bg-[#ecd0a6] [&_th]:border [&_th]:border-[#8d562b]/50 [&_th]:px-1.5 [&_th]:py-0.5
                [&_td]:border [&_td]:border-[#8d562b]/50 [&_td]:px-1.5 [&_td]:py-0.5
              "
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Footer Tags */}
            <div className="mt-2 pt-2 border-t border-[#8d562b]/30 flex flex-wrap items-center justify-between gap-1 shrink-0 text-xs">
              <div className="flex flex-wrap gap-1">
                {(currentBook.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.2 bg-[#fdecd2] text-[#421c08] border border-[#8d562b]/50"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-[#8d562b] italic">
                —— 沉淀自全局指令与真机实战
              </span>
            </div>
          </div>
        ) : (
          <div className="sdv-parchment-sheet h-full flex flex-col items-center justify-center p-8 text-center text-[#78350f]">
            <BookOpen size={40} className="opacity-40 mb-2" />
            <p className="font-bold text-sm">从左侧书架挑选一卷秘籍开始研读</p>
          </div>
        )}
      </div>
    </div>
  );
};
