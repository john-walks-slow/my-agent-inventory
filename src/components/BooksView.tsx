import React, { useState, useMemo } from 'react';
import type { SectionView, ItemView } from '../config/loader';
import { ItemIcon, PixelQualityBadge } from './ItemIcon';
import { retroAudio } from '../audio/retroAudio';
import { getVocab } from '../theme/vocab';
import { marked } from 'marked';
import { BookOpen, Bookmark } from 'lucide-react';

interface BooksViewProps {
  section: SectionView;
  theme?: string;
  activeBookId?: string | null;
  onSelectBook?: (id: string | null) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  section,
  theme,
  activeBookId,
  onSelectBook
}) => {
  const vocab = getVocab(theme);
  const books = section.items;
  const [selectedSub, setSelectedSub] = useState<string>('all');

  // 完全受控：activeBookId 命中当前 section 才用；null/未命中/跨 section 残留一律回退首册
  const currentBook: ItemView | null = books.find((b) => b.id === activeBookId) ?? books[0] ?? null;
  const currentBookId = currentBook?.id ?? null;

  const categoryLabel = (id?: string) =>
    section.categories?.find((c) => c.id === id)?.label ?? '';

  const handleBookClick = (id: string) => {
    retroAudio.playPageTurn();
    onSelectBook?.(id);
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
          <div className="flex flex-wrap gap-1 bg-ui-panel p-1.5 border-2 border-ui-wood-dark rounded-sm mb-2 shrink-0 shadow-inner">
            {[{ id: 'all', label: vocab.hud.allFilter }, ...section.categories].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  retroAudio.playTab();
                  setSelectedSub(tab.id);
                }}
                className={`px-1.5 py-0.5 text-xs font-bold transition-all ${
                  selectedSub === tab.id
                    ? 'bg-ui-cell-active text-ui-ink border border-ui-wood-dark'
                    : 'bg-ui-accent text-white border border-ui-wood-dark hover:bg-ui-accent-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Bookshelf Spine List */}
        <div className="custom-scroll flex-1 bg-ui-panel-warm border-2 border-ui-wood-dark p-2 space-y-1.5 overflow-y-auto shadow-md">
          {filteredBooks.map((book) => {
            const isSelected = book.id === currentBookId;
            return (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.id)}
                onMouseEnter={() => retroAudio.playHover()}
                className={`p-2 border cursor-pointer transition-all flex gap-2 items-start ${
                  isSelected
                    ? 'bg-ui-panel-light border-ui-wood-dark translate-x-1 shadow-[2px_2px_0_var(--color-ui-frame-border)]'
                    : 'bg-ui-panel border-ui-wood-dark/60 hover:bg-ui-highlight'
                }`}
              >
                <div className="relative w-8 h-8 sdv-cell flex items-center justify-center shrink-0 mt-0.5">
                  <ItemIcon iconRef={book.iconRef} size={22} />
                  <PixelQualityBadge rarity={book.rarity} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-ui-ink line-clamp-2 leading-tight">
                    {book.name}
                  </h3>
                  {book.description && (
                    <p className="text-[10px] text-ui-ink-muted line-clamp-1 mt-0.5">
                      {book.description}
                    </p>
                  )}
                  {book.category && (
                    <span className="inline-block mt-1 text-[9px] px-1 py-0.2 bg-ui-highlight-warm text-ui-ink-body border border-ui-wood-mid/50 font-bold">
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
          <div className="sdv-parchment-sheet p-4 sm:p-6 flex-1 flex flex-col h-full overflow-hidden text-ui-ink">
            {/* Header Bookmark */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-ui-wood-mid/40 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ui-wood-mid">
                <Bookmark size={14} />
                <span>{vocab.reader.title} • {currentBook.title ?? currentBook.name}</span>
              </div>
              <div className="text-[11px] font-bold text-ui-ink-muted flex items-center gap-2">
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
              className="custom-scroll flex-1 overflow-y-auto pr-2 max-w-none text-xs sm:text-sm leading-relaxed space-y-2 select-text
                [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-ui-frame-border [&_h1]:border-b [&_h1]:border-ui-wood-mid/50 [&_h1]:pb-1.5
                [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-ui-wood-dark [&_h2]:mt-3
                [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-ui-ink-amber
                [&_p]:leading-relaxed [&_p]:text-ui-ink
                [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
                [&_pre]:bg-ui-bg-deep [&_pre]:text-ui-ink-gold [&_pre]:p-2.5 [&_pre]:border [&_pre]:border-ui-wood-dark [&_pre]:overflow-x-auto
                [&_code]:font-mono [&_code]:text-xs
                [&_blockquote]:border-l-3 [&_blockquote]:border-ui-wood-mid [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_blockquote]:text-ui-wood-dark
                [&_table]:w-full [&_table]:text-xs
                [&_th]:bg-ui-panel [&_th]:border [&_th]:border-ui-wood-mid/50 [&_th]:px-1.5 [&_th]:py-0.5
                [&_td]:border [&_td]:border-ui-wood-mid/50 [&_td]:px-1.5 [&_td]:py-0.5
              "
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Footer Tags */}
            <div className="mt-2 pt-2 border-t border-ui-wood-mid/30 flex flex-wrap items-center justify-between gap-1 shrink-0 text-xs">
              <div className="flex flex-wrap gap-1">
                {(currentBook.tags ?? []).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.2 bg-ui-highlight-warm text-ui-ink-body border border-ui-wood-mid/50"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-ui-wood-mid italic">
                {vocab.reader.sign}
              </span>
            </div>
          </div>
        ) : (
          <div className="sdv-parchment-sheet h-full flex flex-col items-center justify-center p-8 text-center text-ui-ink-muted">
            <BookOpen size={40} className="opacity-40 mb-2" />
            <p className="font-bold text-sm">{vocab.reader.empty}</p>
          </div>
        )}
      </div>
    </div>
  );
};
