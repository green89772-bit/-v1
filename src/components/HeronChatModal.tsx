import React, { useState } from 'react';
import { ChatMessage, AppTheme, ChapterUserResponse } from '../types';
import { sendHeronChatMessage } from '../utils/gemini';
import { X, Send, Feather, Sparkles, Bot, User } from 'lucide-react';
import { BOOK_TITLE } from '../data/chapters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userResponses: ChapterUserResponse[];
  theme: AppTheme;
}

export const HeronChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userResponses,
  theme,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'heron',
      text: '你好，我是蒼鷺醫生。此刻壁爐裡的火光正暖，茶水溫熱。不論你是在哪一個章節感到卡住，或想更深層剖析你內心的「苛刻父母」與「適應型兒童」，請隨時告訴我。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isPaper = theme === 'paper';

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const chatHistoryForApi = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const replyText = await sendHeronChatMessage(chatHistoryForApi, textToSend);

      const heronMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'heron',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, heronMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'heron',
          text: '請記住，當你停下來審視內心時，你已經站回了成人狀態。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMyResponses = () => {
    if (userResponses.length === 0) {
      handleSendMessage('蒼鷺醫生，我還沒開始閱讀，可以先為我簡介交流分析（TA）嗎？');
      return;
    }

    const summary = userResponses
      .map((r) => `【第${r.chapterId}章】覺察：${r.statementUsed} ｜ 點撥：${r.feedbackGiven}`)
      .join('\n');

    handleSendMessage(`蒼鷺醫生，這是我在《未啟程的遠方》中的所有反思紀錄：\n${summary}\n\n請以蒼鷺醫生的敏銳視角，幫我總結我目前的心理狀態與成人成長建議。`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden relative ${
        isPaper
          ? 'bg-[#fbf9f5] border-amber-900/30 text-amber-950'
          : 'bg-[#15100d] border-amber-800/50 text-amber-100'
      }`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-600/30 flex items-center justify-between bg-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-md">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-400">
                蒼鷺醫生的隨身診室
              </h3>
              <p className="text-xs text-amber-300/70">{BOOK_TITLE} · 心理諮察對話</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-amber-900/40 text-amber-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-amber-950/20 border-b border-amber-900/20 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap scrollbar-none">
          <button
            onClick={handleAnalyzeMyResponses}
            className="px-3 py-1.5 rounded-full bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>總結剖析我的五章歷程</span>
          </button>
          <button
            onClick={() => handleSendMessage('蒼鷺醫生，當苛刻的父母狀態再度斥責我時，我具體該怎麼做？')}
            className="px-3 py-1.5 rounded-full bg-amber-900/40 hover:bg-amber-900/70 text-amber-200 border border-amber-800/40 transition-colors"
          >
            如何面對「苛刻父母」？
          </button>
          <button
            onClick={() => handleSendMessage('為什麼我在放鬆散步做家事時會有一種罪惡感？')}
            className="px-3 py-1.5 rounded-full bg-amber-900/40 hover:bg-amber-900/70 text-amber-200 border border-amber-800/40 transition-colors"
          >
            休息的罪惡感何來？
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-serif">
          {messages.map((msg) => {
            const isHeron = msg.sender === 'heron';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isHeron ? 'justify-start' : 'justify-end'}`}
              >
                {isHeron && (
                  <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] p-4 rounded-2xl text-sm sm:text-base leading-relaxed ${
                  isHeron
                    ? isPaper
                      ? 'bg-amber-100 border border-amber-900/15 text-amber-950 rounded-tl-none'
                      : 'bg-amber-950/60 border border-amber-800/40 text-amber-100 rounded-tl-none'
                    : 'bg-amber-600 text-white rounded-tr-none shadow-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 text-right ${
                    isHeron ? 'opacity-60' : 'text-amber-200'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {!isHeron && (
                  <div className="w-8 h-8 rounded-full bg-orange-700 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-amber-500 text-xs italic">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/30 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>蒼鷺醫生正深思回覆中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-amber-600/30 bg-amber-950/40 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="請輸入你對章節的疑惑或心靈感受..."
            className={`flex-1 p-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isPaper
                ? 'bg-white border-amber-900/20 text-amber-950'
                : 'bg-[#120e0c] border-amber-800/40 text-amber-100 placeholder:text-amber-800'
            }`}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-amber-950/40 text-white font-bold transition-all shadow active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
