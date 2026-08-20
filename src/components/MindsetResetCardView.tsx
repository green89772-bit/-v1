import React, { useRef, useState } from 'react';
import { ChapterUserResponse, AppTheme } from '../types';
import { CHAPTERS, BOOK_TITLE } from '../data/chapters';
import {
  Copy,
  Check,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  MessageSquareText,
  Feather,
  Heart
} from 'lucide-react';

interface Props {
  responses: ChapterUserResponse[];
  onRestart: () => void;
  onOpenChat: () => void;
  theme: AppTheme;
}

export const MindsetResetCardView: React.FC<Props> = ({
  responses,
  onRestart,
  onOpenChat,
  theme,
}) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isPaper = theme === 'paper';
  const isMidnight = theme === 'midnight';

  // Construct Markdown Table String
  const generateMarkdownTable = () => {
    let md = `### 【全書完畢｜你的專屬口袋思維重置卡】\n\n`;
    md += `*《未啟程的遠方》引導者：蒼鷺醫生*\n\n`;
    md += `| 章節 | 你的覺察與選擇 | 蒼鷺醫生的處方點撥 | 成人狀態重置宣告 |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    CHAPTERS.forEach((ch) => {
      const resp = responses.find((r) => r.chapterId === ch.id);
      const chName = ch.title.split('｜')[0] || `第${ch.id}章`;
      const selection = resp ? resp.statementUsed : '尚未完成選擇';
      const feedback = resp ? resp.feedbackGiven : '尚未獲得點撥';
      const declaration = resp ? resp.resetDeclaration : '尚未重置';

      md += `| **${chName}** | ${selection.replace(/\|/g, '&#124;')} | ${feedback.replace(/\|/g, '&#124;')} | **${declaration.replace(/\|/g, '&#124;')}** |\n`;
    });

    md += `\n> *「無論何時何地，你隨時都能回到這個內在的壁爐旁，用成人的清醒與寬容重新安頓自己。」 — 蒼鷺醫生*`;
    return md;
  };

  const markdownText = generateMarkdownTable();

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Export Card as Image PNG using Canvas
  const handleDownloadImage = () => {
    if (!cardRef.current) return;
    const element = cardRef.current;

    // Use Canvas drawing to export high resolution PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 1100;
    canvas.width = width * 2; // high DPI
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Background fill
    ctx.fillStyle = '#17120f';
    ctx.fillRect(0, 0, width, height);

    // Decorative border frame
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(26, 26, width - 52, height - 52);

    // Header Title
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('《未啟程的遠方》', width / 2, 70);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px serif';
    ctx.fillText('【個人專屬口袋思維重置卡】', width / 2, 105);

    ctx.fillStyle = '#d97706';
    ctx.font = 'italic 14px serif';
    ctx.fillText('引導者：蒼鷺醫生 · 交流分析 (TA) 成人狀態重置語錄', width / 2, 130);

    let y = 180;

    // Draw each chapter row
    CHAPTERS.forEach((ch, idx) => {
      const resp = responses.find((r) => r.chapterId === ch.id);
      ctx.fillStyle = '#261c16';
      ctx.fillRect(40, y, width - 80, 150);

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, y, width - 80, 150);

      // Chapter badge
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'left';
      ctx.fillText(`▶ ${ch.title}`, 55, y + 30);

      // Statement
      ctx.fillStyle = '#d1d5db';
      ctx.font = '13px sans-serif';
      const statement = resp ? resp.statementUsed : '未選擇';
      const truncatedStatement = statement.length > 55 ? statement.substring(0, 55) + '...' : statement;
      ctx.fillText(`覺察：${truncatedStatement}`, 55, y + 60);

      // Feedback
      ctx.fillStyle = '#fde68a';
      ctx.font = 'italic 13px serif';
      const feedback = resp ? resp.feedbackGiven : '未獲得';
      const truncatedFeedback = feedback.length > 50 ? feedback.substring(0, 50) + '...' : feedback;
      ctx.fillText(`蒼鷺處方：${truncatedFeedback}`, 55, y + 90);

      // Reset Declaration
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px sans-serif';
      const decl = resp ? resp.resetDeclaration : '未設定';
      ctx.fillText(`重置宣告：${decl}`, 55, y + 120);

      y += 165;
    });

    // Footer Quote
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'italic 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('「無論何時何地，你隨時都能回到這個內在的壁爐旁，用成人的清醒與寬容重新安頓自己。」', width / 2, height - 55);

    ctx.fillStyle = '#78350f';
    ctx.font = '12px sans-serif';
    ctx.fillText('— 蒼鷺醫生 簽署存照 —', width / 2, height - 35);

    // Download PNG
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `未啟程的遠方_思維重置卡_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = imageURI;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
      {/* End of Journey Congratulations Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-600/20 text-amber-400 text-xs sm:text-sm font-serif mb-3 border border-amber-500/40">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>五章反思旅程圓滿達成</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-3">
          【全書完畢｜你的專屬口袋思維重置卡】
        </h1>
        <p className={`max-w-2xl mx-auto text-sm sm:text-base leading-relaxed ${
          isPaper ? 'text-amber-900/80' : 'text-amber-200/80'
        }`}>
          恭喜你與蛤蟆一同經歷了這五章的心靈洗禮。以下是蒼鷺醫生根據你的選擇與覺察，為你揉合生成的<strong>成人狀態口袋思維重置卡</strong>。請隨身攜帶，當焦慮再次襲來時，隨時翻閱重置。
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <button
          onClick={handleCopyMarkdown}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '已複製 Markdown 表格' : '複製 Markdown 表格'}</span>
        </button>

        <button
          onClick={handleDownloadImage}
          className={`px-4 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center gap-2 transition-all border shadow-md active:scale-95 ${
            isPaper
              ? 'bg-amber-100 text-amber-900 border-amber-900/20 hover:bg-amber-200'
              : 'bg-amber-950/80 text-amber-300 border-amber-800/50 hover:bg-amber-900/60'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>下載重置卡圖片 (PNG)</span>
        </button>

        <button
          onClick={handlePrint}
          className={`px-4 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center gap-2 transition-all border shadow-md active:scale-95 ${
            isPaper
              ? 'bg-amber-100 text-amber-900 border-amber-900/20 hover:bg-amber-200'
              : 'bg-amber-950/80 text-amber-300 border-amber-800/50 hover:bg-amber-900/60'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>列印 / 另存 PDF</span>
        </button>

        <button
          onClick={onOpenChat}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:from-amber-500 hover:to-orange-500 transition-all active:scale-95"
        >
          <MessageSquareText className="w-4 h-4" />
          <span>與蒼鷺醫生進一步對話</span>
        </button>
      </div>

      {/* Styled Card Container (Visual View) */}
      <div
        ref={cardRef}
        className={`p-6 sm:p-10 rounded-3xl border-2 shadow-2xl relative overflow-hidden mb-12 transition-colors ${
          isPaper
            ? 'bg-[#fbf9f5] border-amber-900/30 text-amber-950 shadow-amber-950/10'
            : isMidnight
            ? 'bg-[#101826] border-cyan-900/40 text-slate-100 shadow-cyan-950/40'
            : 'bg-[#18120e] border-amber-800/50 text-amber-100 shadow-black/90'
        }`}
      >
        {/* Decorative Stamp Header */}
        <div className="flex items-center justify-between border-b pb-6 mb-8 border-amber-600/30">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-900/40">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-amber-500">
                【個人專屬口袋思維重置卡】
              </h2>
              <p className="text-xs text-amber-600/80 font-serif">
                {BOOK_TITLE} · 蒼鷺醫生的診察處方
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="inline-block px-3 py-1 rounded border border-amber-500/40 text-[11px] font-mono text-amber-500 uppercase tracking-widest">
              ADULT STATE RESET
            </span>
          </div>
        </div>

        {/* Render Formatted Markdown Table for prompt strict adherence */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse text-xs sm:text-sm font-serif">
            <thead>
              <tr className={`border-b ${isPaper ? 'bg-amber-100/60 border-amber-900/20 text-amber-950' : 'bg-amber-950/50 border-amber-800/40 text-amber-400'}`}>
                <th className="p-3 sm:p-4 font-bold min-w-[100px]">章節</th>
                <th className="p-3 sm:p-4 font-bold min-w-[180px]">你的覺察與選擇</th>
                <th className="p-3 sm:p-4 font-bold min-w-[200px]">蒼鷺醫生的處方點撥</th>
                <th className="p-3 sm:p-4 font-bold min-w-[180px]">成人狀態重置宣告</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-800/20">
              {CHAPTERS.map((ch) => {
                const resp = responses.find((r) => r.chapterId === ch.id);
                const chShortTitle = ch.title.split('｜')[0];

                return (
                  <tr
                    key={ch.id}
                    className={`transition-colors ${
                      isPaper
                        ? 'hover:bg-amber-50'
                        : 'hover:bg-amber-950/20'
                    }`}
                  >
                    <td className="p-3 sm:p-4 font-bold text-amber-500 whitespace-nowrap">
                      {chShortTitle}
                    </td>
                    <td className={`p-3 sm:p-4 leading-relaxed ${isPaper ? 'text-amber-950' : 'text-amber-100'}`}>
                      {resp ? resp.statementUsed : '尚未選擇'}
                    </td>
                    <td className="p-3 sm:p-4 italic leading-relaxed text-amber-600 dark:text-amber-300">
                      {resp ? `「${resp.feedbackGiven}」` : '尚未點撥'}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold text-amber-500 dark:text-amber-400">
                      {resp ? resp.resetDeclaration : '尚未重置'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dr. Heron Signature & Quote Box */}
        <div className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
          isPaper ? 'bg-amber-100/50 border-amber-900/20' : 'bg-amber-950/40 border-amber-800/40'
        }`}>
          <p className="font-serif italic text-sm sm:text-base text-amber-500 mb-2">
            「無論何時何地，你隨時都能回到這個內在的壁爐旁，用成人的清醒與寬容重新安頓自己。」
          </p>
          <p className="text-xs font-serif text-amber-700 dark:text-amber-400/70 tracking-widest uppercase">
            — 蒼鷺醫生 於《未啟程的遠方》最後的寄語 —
          </p>
        </div>
      </div>

      {/* Raw Markdown Output Block */}
      <div className={`p-6 rounded-2xl border mb-12 ${
        isPaper ? 'bg-white border-amber-900/20' : 'bg-[#120e0c] border-amber-900/40'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-serif font-bold text-xs uppercase tracking-widest text-amber-500">
            MARKDOWN 原生格式 (可直接複製使用)
          </span>
          <button
            onClick={handleCopyMarkdown}
            className="text-xs text-amber-500 hover:underline flex items-center gap-1"
          >
            {copied ? '已複製' : '複製全文'}
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-black/40 text-amber-200/90 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed border border-amber-900/30">
          {markdownText}
        </pre>
      </div>

      {/* Restart Reader Option */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className={`px-8 py-3.5 rounded-2xl font-serif font-bold text-sm transition-all inline-flex items-center gap-2 border shadow-lg active:scale-95 ${
            isPaper
              ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-900/30'
              : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-800/50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>重新閱讀《未啟程的遠方》</span>
        </button>
      </div>
    </div>
  );
};
