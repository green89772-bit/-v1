import React, { useState } from 'react';
import { CHAPTERS } from '../data/chapters';
import { ChapterView } from './ChapterView';
import { AppTheme, ChapterUserResponse } from '../types';
import { BookOpen, Sparkles } from 'lucide-react';

interface Props {
  theme: AppTheme;
  responses: Record<number, ChapterUserResponse>;
  onSaveResponse: (response: ChapterUserResponse) => void;
}

export const MindLibraryView: React.FC<Props> = ({ theme, responses, onSaveResponse }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);

  const activeChapter = CHAPTERS.find((c) => c.id === selectedChapterId) || CHAPTERS[0];

  const handleNextChapter = () => {
    if (selectedChapterId < CHAPTERS.length) {
      setSelectedChapterId(selectedChapterId + 1);
    }
  };

  return (
    <div className="bg-[var(--sb-canvas)] text-[var(--sb-primary)] min-h-[calc(100vh-4rem)] transition-colors duration-500 py-8 px-4 font-serif">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Chapter Selection Bar */}
        <div className="bg-[var(--sb-card)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--sb-pencil)] shadow-[var(--sb-shadow)]">
          <div className="flex items-center gap-2 text-[var(--sb-primary)]">
            <BookOpen className="w-5 h-5 text-[var(--sb-rust)]" />
            <h2 className="font-bold text-base">《未啟程的遠方》心靈圖書室</h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {CHAPTERS.map((ch) => {
              const isSelected = ch.id === selectedChapterId;
              const isRead = !!responses[ch.id];

              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-medium transition-all flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-[var(--sb-rust)] text-white shadow-sm'
                      : isRead
                      ? 'bg-[var(--sb-jade-tint)] border border-[var(--sb-jade)] text-[var(--sb-jade)]'
                      : 'bg-transparent border border-[var(--sb-pencil)] text-[var(--sb-secondary)] hover:text-[var(--sb-primary)]'
                  }`}
                >
                  <span>第 {ch.id} 章</span>
                  {isRead && <Sparkles className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[var(--sb-jade)]'}`} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Chapter Reader View */}
        <ChapterView
          chapter={activeChapter}
          currentResponse={responses[activeChapter.id]}
          onSaveResponse={onSaveResponse}
          onNextChapter={handleNextChapter}
          isLastChapter={activeChapter.id === CHAPTERS.length}
          theme={theme}
        />
      </div>
    </div>
  );
};
