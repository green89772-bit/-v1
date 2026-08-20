import React, { useState } from 'react';
import { Chapter, OptionKey, AppTheme, ChapterUserResponse } from '../types';
import { HeronFeedback } from './HeronFeedback';
import { getHeronCustomInsight } from '../utils/gemini';

interface Props {
  chapter: Chapter;
  currentResponse?: ChapterUserResponse;
  onSaveResponse: (response: ChapterUserResponse) => void;
  onNextChapter: () => void;
  isLastChapter: boolean;
  theme: AppTheme; // Not used anymore for styling, but kept for interface compatibility
}

export const ChapterView: React.FC<Props> = ({
  chapter,
  currentResponse,
  onSaveResponse,
  onNextChapter,
  isLastChapter,
}) => {
  const [selectedKey, setSelectedKey] = useState<OptionKey | null>(
    currentResponse ? currentResponse.selectedOptionKey : null
  );
  const [customText, setCustomText] = useState<string>(
    currentResponse?.customText || ''
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectOption = (key: OptionKey) => {
    setSelectedKey(key);
  };

  const handleSubmitReflection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedKey) return;

    const opt = chapter.options.find(o => o.key === selectedKey);
    if (!opt) return;

    setIsSubmitting(true);

    let statementUsed = opt.statement;
    let feedbackGiven = opt.defaultFeedback;
    let resetDeclaration = opt.defaultResetDeclaration;

    if (selectedKey === 'D') {
      const userInputValue = customText.trim() || '我感受到了深層的內耗與防禦，希望尋找平靜。';
      statementUsed = `[自由抒發] ${userInputValue}`;
      resetDeclaration = `真實抒發：${userInputValue.slice(0, 30)}${userInputValue.length > 30 ? '...' : ''}`;
      
      try {
        feedbackGiven = await getHeronCustomInsight(chapter.title, userInputValue);
      } catch {
        feedbackGiven = opt.defaultFeedback;
      }
    }

    const responseObj: ChapterUserResponse = {
      chapterId: chapter.id,
      selectedOptionKey: selectedKey,
      customText: selectedKey === 'D' ? customText : undefined,
      statementUsed,
      feedbackGiven,
      resetDeclaration,
      timestamp: new Date().toISOString(),
    };

    onSaveResponse(responseObj);
    setIsSubmitting(false);
  };

  const renderStoryMarkdown = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, i) => {
      if (para.startsWith('- ')) {
        const bulletItems = para.split('\n- ').map(item => item.replace(/^- /, ''));
        return (
          <ul key={i} className="my-4 space-y-2.5 pl-4 list-disc text-[var(--sb-secondary)]">
            {bulletItems.map((item, bIdx) => (
              <li key={bIdx} className="text-base leading-relaxed">
                <span dangerouslySetInnerHTML={{
                  __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--sb-primary)] font-semibold">$1</strong>')
                }} />
              </li>
            ))}
          </ul>
        );
      }

      if (para.match(/^\d+\.\s/)) {
        const listItems = para.split(/\n(?=\d+\.\s)/);
        return (
          <ol key={i} className="my-4 space-y-3 pl-4 list-decimal text-[var(--sb-secondary)]">
            {listItems.map((item, lIdx) => {
              const cleanItem = item.replace(/^\d+\.\s/, '');
              return (
                <li key={lIdx} className="text-base leading-relaxed">
                  <span dangerouslySetInnerHTML={{
                    __html: cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--sb-primary)] font-semibold">$1</strong>')
                  }} />
                </li>
              );
            })}
          </ol>
        );
      }

      return (
        <p key={i} className="text-base leading-relaxed text-[var(--sb-secondary)]" dangerouslySetInnerHTML={{
          __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--sb-primary)] font-semibold">$1</strong>')
        }} />
      );
    });
  };

  return (
    <div className="bg-[var(--sb-card)] w-full max-w-2xl mx-auto rounded-3xl shadow-[var(--sb-shadow)] border border-[var(--sb-pencil)] p-6 md:p-12 relative overflow-hidden transition-all duration-500 font-serif">
      
      {/* 頂部資訊列與黑貓伴讀系統 */}
      <header className="flex justify-between items-start mb-10">
        {/* 章節與進度 (Accent Rust) */}
        <div className="flex items-center gap-3">
          <span className="text-[var(--sb-rust)] font-bold tracking-widest text-sm uppercase">CHAPTER {chapter.id.toString().padStart(2, '0')}</span>
          <div className="h-px w-8 bg-[var(--sb-rust)] opacity-30"></div>
          <span className="text-[var(--sb-secondary)] text-xs tracking-wider">{chapter.subtitle}</span>
        </div>

        {/* 黑貓伴讀微互動 */}
        <div className="relative group cursor-pointer" title="蒼鷺醫生的守護貓">
          {/* 呼吸燈 (代表安靜聆聽) */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--sb-jade)] animate-pulse opacity-80"></span>
          
          {/* SVG 黑貓 (綠眼) */}
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <path d="M20 14C15.5 14 13 17.5 13 22C13 25.5 15 28 18 29.5V36H22V29.5C25 28 27 25.5 27 22C27 17.5 24.5 14 20 14Z" fill="#232220"/>
            <path d="M13 18L10 8L17 14L13 18Z" fill="#232220"/>
            <path d="M27 18L30 8L23 14L27 18Z" fill="#232220"/>
            {/* 翡翠綠眼 */}
            <ellipse cx="17" cy="21" rx="2" ry="3" fill="#4E876A" className="transition-all duration-300 group-hover:ry-1"/>
            <ellipse cx="23" cy="21" rx="2" ry="3" fill="#4E876A" className="transition-all duration-300 group-hover:ry-1"/>
          </svg>
        </div>
      </header>

      {/* 文本閱讀區 */}
      <article className="space-y-6 mb-12">
        <h1 className="text-3xl font-bold leading-snug tracking-wide text-[var(--sb-primary)]">
          {chapter.title}
        </h1>
        
        <div className="text-base leading-relaxed text-[var(--sb-secondary)] space-y-6">
          {renderStoryMarkdown(chapter.contentMarkdown)}
        </div>
      </article>

      {/* 互動反思選項區 (Healing Jade) */}
      <div className="space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--sb-canvas)] border border-[var(--sb-pencil)] text-xs text-[var(--sb-secondary)] tracking-widest mb-2">
          請選擇你此刻最真實的心聲
        </div>

        {chapter.options.map((opt) => {
          const isSelected = selectedKey === opt.key;

          return (
            <div key={opt.key} className="relative">
              <button
                onClick={() => handleSelectOption(opt.key)}
                className={`w-full text-left group flex items-center p-5 rounded-2xl transition-all duration-300 ${
                  isSelected 
                    ? 'border border-[var(--sb-jade)] bg-[var(--sb-jade-tint)] -translate-y-0.5 ring-1 ring-[var(--sb-jade)]/30 shadow-sm'
                    : 'border border-[var(--sb-pencil)] bg-[var(--sb-card)] hover:border-[var(--sb-jade)] hover:bg-[var(--sb-jade-tint)] hover:-translate-y-0.5'
                }`}
              >
                <span className={`font-bold mr-4 transition-opacity ${isSelected ? 'text-[var(--sb-jade)] opacity-100' : 'text-[var(--sb-jade)] opacity-50 group-hover:opacity-100'}`}>
                  {opt.key}
                </span>
                
                <span className="text-[var(--sb-primary)] text-sm md:text-base leading-relaxed relative z-10 flex-1">
                  {opt.statement}
                </span>
                
                {/* 貓爪印微動效 */}
                <span className={`text-[var(--sb-jade)] text-lg transition-all duration-300 transform ${
                  isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}>
                  🐾
                </span>
              </button>

              {/* Custom Text Area for Option D */}
              {opt.key === 'D' && isSelected && (
                <div className="mt-4 p-4 border border-[var(--sb-jade)]/30 bg-[var(--sb-canvas)] rounded-2xl animate-fadeIn">
                  <label className="block text-xs text-[var(--sb-jade)] mb-2 font-bold tracking-wider">
                    請寫下你當下真實的抒發（蒼鷺醫生將為你剖析防禦機制）：
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="例如：當我看到螢幕上的強人時，我感到很焦慮，覺得自己每天都很漫無目的..."
                    rows={3}
                    className="w-full p-3 rounded-xl text-sm border border-[var(--sb-pencil)] focus:outline-none focus:border-[var(--sb-jade)] bg-[var(--sb-card)] text-[var(--sb-primary)] placeholder-[var(--sb-secondary)]/50"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!currentResponse && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmitReflection}
            disabled={!selectedKey || (selectedKey === 'D' && !customText.trim()) || isSubmitting}
            className={`px-8 py-3 rounded-2xl font-bold text-sm tracking-widest transition-all duration-300 flex items-center gap-2 ${
              selectedKey && (selectedKey !== 'D' || customText.trim()) && !isSubmitting
                ? 'bg-[var(--sb-rust)] hover:bg-[#c26528] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                : 'bg-[var(--sb-canvas)] text-[var(--sb-secondary)] border border-[var(--sb-pencil)] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>蒼鷺點撥中...</span>
              </>
            ) : (
              <span>提交反思</span>
            )}
          </button>
        </div>
      )}

      {/* Render Heron's Feedback if Response Exists */}
      {currentResponse && (
        <div className="mt-12 pt-10 border-t border-[var(--sb-pencil)]">
          <HeronFeedback
            feedback={currentResponse.feedbackGiven}
            isLastChapter={isLastChapter}
            onNextChapter={onNextChapter}
            theme="paper" 
          />
        </div>
      )}
    </div>
  );
};
