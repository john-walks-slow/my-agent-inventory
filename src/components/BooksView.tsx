import React, { useState, useMemo } from 'react';
import type { BookDocument, BookSubCategory } from '../types/inventory';
import { PixelIcon, QualityStar } from './PixelIcon';
import { retroAudio } from '../audio/retroAudio';
import { marked } from 'marked';
import { BookOpen, Clock, Calendar, Bookmark } from 'lucide-react';

interface BooksViewProps {
  books: BookDocument[];
  activeBookId?: string | null;
  onSelectBook?: (id: string | null) => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  books,
  activeBookId,
  onSelectBook
}) => {
  const [selectedSub, setSelectedSub] = useState<BookSubCategory | 'all'>('all');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    activeBookId || books[0]?.id || null
  );

  const currentBookId = activeBookId !== undefined ? activeBookId : internalSelectedId;
  const currentBook = books.find((b) => b.id === currentBookId) || null;

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
    return b.subCategory === selectedSub;
  });

  // Render Markdown to HTML with Prism syntax highlighting
  const renderedContent = useMemo(() => {
    if (!currentBook) return '';
    marked.setOptions({
      gfm: true,
      breaks: true
    });
    const html = marked.parse(currentBook.content) as string;
    return html;
  }, [currentBook]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left Column: Bookshelf / Table of Contents */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-2">
        {/* Subcategory Filter Pills */}
        <div className="flex flex-wrap gap-1 bg-[#e4ae6e] p-2 border-2 border-[#853605] rounded-sm">
          {[
            { id: 'all', label: '全部典籍' },
            { id: 'pitfalls', label: '实战踩坑' },
            { id: 'container', label: '容器架构' },
            { id: 'agent-tricks', label: 'Agent心法' },
            { id: 'architecture', label: '网络隧道' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                retroAudio.playTab();
                setSelectedSub(tab.id as BookSubCategory | 'all');
              }}
              className={`px-2 py-1 text-xs font-bold transition-all ${
                selectedSub === tab.id
                  ? 'bg-[#ffe4a1] text-[#5b2b2a] border-2 border-[#853605]'
                  : 'bg-[#d68f54] text-[#3a1a06] border border-[#853605] hover:bg-[#eba867]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Books List (Bookshelf spine style) */}
        <div className="flex-1 bg-[#d68f54] border-4 border-[#853605] p-2 space-y-2 overflow-y-auto max-h-[600px] shadow-inner">
          {filteredBooks.map((book) => {
            const isSelected = book.id === currentBookId;
            return (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.id)}
                onMouseEnter={() => retroAudio.playHover()}
                className={`p-2.5 border-2 cursor-pointer transition-all flex gap-2.5 items-start ${
                  isSelected
                    ? 'bg-[#f7e8c3] border-[#853605] translate-x-1 shadow-[2px_2px_0_#5b2b2a]'
                    : 'bg-[#ffc376] border-[#853605]/70 hover:bg-[#ffe4a1] hover:border-[#853605]'
                }`}
              >
                <div className="relative w-9 h-9 sdv-slot flex items-center justify-center shrink-0 mt-0.5">
                  <PixelIcon name={book.iconType} size={20} color="#853605" />
                  <QualityStar rarity={book.rarity} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[#3a1a06] line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#853605]">
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} /> {book.readTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar size={10} /> {book.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Parchment Reader */}
      <div className="flex-1 min-w-0 flex flex-col">
        {currentBook ? (
          <div className="sdv-parchment p-5 sm:p-7 flex-1 overflow-y-auto max-h-[720px] text-[#3a1a06] relative">
            {/* Header Bookmark */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#916132]/60">
              <div className="flex items-center gap-2 text-xs font-bold text-[#916132]">
                <Bookmark size={16} />
                <span>星露谷图书馆藏书 • {currentBook.subtitle}</span>
              </div>
              <div className="text-xs font-bold text-[#853605] flex items-center gap-3">
                <span>作者: {currentBook.author}</span>
                <span>阅读用时: {currentBook.readTime}</span>
              </div>
            </div>

            {/* Markdown Body */}
            <div
              className="prose prose-stone max-w-none text-sm leading-relaxed space-y-3
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#4d2208] [&_h1]:border-b-2 [&_h1]:border-[#916132] [&_h1]:pb-2
                [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#5b2b2a] [&_h2]:mt-4
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#853605]
                [&_p]:leading-relaxed [&_p]:text-[#3a1a06]
                [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                [&_pre]:bg-[#2b1d14] [&_pre]:text-[#ffe4a1] [&_pre]:p-3 [&_pre]:rounded [&_pre]:border-2 [&_pre]:border-[#5b2b2a] [&_pre]:overflow-x-auto
                [&_code]:font-mono [&_code]:text-xs
                [&_blockquote]:border-l-4 [&_blockquote]:border-[#916132] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#5b2b2a]
              "
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {/* Tags Footer */}
            <div className="mt-8 pt-4 border-t-2 border-[#916132]/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {currentBook.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 bg-[#e0cca2] text-[#4d2208] border border-[#916132] rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <span className="text-xs text-[#916132] font-serif italic">
                —— 沉淀自真机环境与生产实战
              </span>
            </div>
          </div>
        ) : (
          <div className="sdv-parchment h-full flex flex-col items-center justify-center p-8 text-center text-[#853605]">
            <BookOpen size={48} className="opacity-50 mb-3" />
            <p className="font-bold text-lg">从左侧书架挑选一本典籍开始研读</p>
          </div>
        )}
      </div>
    </div>
  );
};
