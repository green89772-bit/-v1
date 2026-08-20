import React from 'react';
import { ArrowRight, Feather, Sparkles } from 'lucide-react';
import { AppTheme } from '../types';

interface Props {
  feedback: string;
  isLastChapter: boolean;
  onNextChapter: () => void;
  isLoadingFeedback?: boolean;
  theme: AppTheme;
}

export const HeronFeedback: React.FC<Props> = ({
  feedback,
  isLastChapter,
  onNextChapter,
  isLoadingFeedback = false,
}) => {
  return (
    <div className="animate-fadeIn font-serif">
      {/* Heron Quote Box */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--sb-jade)]/20 bg-[var(--sb-jade-tint)] relative overflow-hidden transition-all shadow-sm">
        
        {/* Decorative Feather Watermark Background */}
        <div className="absolute right-3 bottom-2 opacity-[0.03] pointer-events-none text-[var(--sb-jade)]">
          <Feather className="w-32 h-32" />
        </div>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-full bg-[var(--sb-jade)]/20 text-[var(--sb-jade)] border border-[var(--sb-jade)]/30">
            <Feather className="w-4 h-4" />
          </div>
          <span className="font-bold text-[var(--sb-jade)] tracking-wider text-sm sm:text-base">
            蒼鷺醫生的回饋：
          </span>
          {isLoadingFeedback && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--sb-jade)] animate-pulse ml-auto">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              蒼鷺醫生正深思點撥中...
            </span>
          )}
        </div>

        {/* Quote Content Block */}
        <blockquote className="pl-4 border-l-4 border-[var(--sb-jade)]/50 italic text-base sm:text-lg leading-relaxed text-[var(--sb-primary)]/90">
          {isLoadingFeedback ? (
            <div className="space-y-2 py-1">
              <div className="h-4 bg-[var(--sb-jade)]/20 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-[var(--sb-jade)]/15 rounded animate-pulse w-1/2" />
            </div>
          ) : (
            `「${feedback}」`
          )}
        </blockquote>
      </div>

      {/* Chapter Divider */}
      <div className="my-8 flex items-center justify-center gap-4">
        <div className="h-[1px] flex-1 bg-[var(--sb-pencil)]" />
        <span className="text-xs tracking-widest uppercase text-[var(--sb-secondary)]/50">
          ◆ 蒼鷺陪伴點撥 ◆
        </span>
        <div className="h-[1px] flex-1 bg-[var(--sb-pencil)]" />
      </div>

      {/* Next Chapter / Finish Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNextChapter}
          disabled={isLoadingFeedback}
          className={`px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center gap-3 shadow-sm active:scale-95 cursor-pointer ${
            isLastChapter
              ? 'bg-[var(--sb-jade)] text-white hover:bg-[#3e6c54] shadow-md'
              : 'bg-[var(--sb-card)] text-[var(--sb-primary)] border border-[var(--sb-pencil)] hover:border-[var(--sb-rust)] hover:text-[var(--sb-rust)]'
          }`}
        >
          <span>{isLastChapter ? '閱讀完成：關上這本書' : '進入下一章'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
