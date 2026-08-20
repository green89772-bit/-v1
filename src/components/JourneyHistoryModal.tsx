import React from 'react';
import { ChapterUserResponse, AppTheme } from '../types';
import { CHAPTERS, BOOK_TITLE } from '../data/chapters';
import { X, History, CheckCircle2, Feather, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userResponses: ChapterUserResponse[];
  onSelectChapter: (chId: number) => void;
  theme: AppTheme;
}

export const JourneyHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userResponses,
  onSelectChapter,
  theme,
}) => {
  const isPaper = theme === 'paper';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
        isPaper
          ? 'bg-[#fbf9f5] border-amber-900/30 text-amber-950'
          : 'bg-[#15100d] border-amber-800/50 text-amber-100'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-600/30 flex items-center justify-between bg-amber-950/40">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-400">
                《未啟程的遠方》過往章節反思歷程
              </h3>
              <p className="text-xs text-amber-300/70">
                已完成 {userResponses.length} / {CHAPTERS.length} 章節反思
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-900/40 text-amber-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-serif">
          {CHAPTERS.map((ch) => {
            const resp = userResponses.find((r) => r.chapterId === ch.id);

            return (
              <div
                key={ch.id}
                className={`p-5 rounded-2xl border transition-all ${
                  resp
                    ? isPaper
                      ? 'bg-amber-100/50 border-amber-900/20'
                      : 'bg-amber-950/40 border-amber-800/40'
                    : isPaper
                    ? 'bg-white/50 border-amber-900/10 opacity-60'
                    : 'bg-black/30 border-amber-900/20 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-600 text-white">
                      第 {ch.id} 章
                    </span>
                    <h4 className="font-bold text-base text-amber-500">
                      {ch.title}
                    </h4>
                  </div>
                  {resp ? (
                    <span className="flex items-center gap-1 text-xs text-amber-400">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" />
                      已完成反思
                    </span>
                  ) : (
                    <span className="text-xs opacity-50">尚未閱讀</span>
                  )}
                </div>

                {resp ? (
                  <div className="space-y-2 mt-3 pl-2 border-l-2 border-amber-500/50 text-xs sm:text-sm">
                    <div>
                      <span className="font-bold text-amber-500">你的選擇：</span>
                      <p className="mt-0.5 leading-relaxed">{resp.statementUsed}</p>
                    </div>
                    <div>
                      <span className="font-bold text-amber-400 flex items-center gap-1 mt-2">
                        <Feather className="w-3.5 h-3.5 text-amber-500" />
                        蒼鷺醫生的點撥：
                      </span>
                      <p className="mt-0.5 italic text-amber-300/90 leading-relaxed">
                        「{resp.feedbackGiven}」
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs italic opacity-60 mt-2">
                    完成閱讀該章節後將解鎖專屬成人狀態點撥。
                  </p>
                )}

                <div className="mt-3 text-right">
                  <button
                    onClick={() => {
                      onSelectChapter(ch.id);
                      onClose();
                    }}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 ml-auto"
                  >
                    <span>{resp ? '重溫本章' : '開始閱讀本章'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
