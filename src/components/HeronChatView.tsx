import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquareText, Sparkles, User, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendHeronChatMessage } from '../utils/gemini';

export const HeronChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'heron',
      text: '我是蒼鷺醫生。此刻壁爐裡的柴火正暖，請隨時告訴我你心裡的焦慮、當機或困惑，我們一起從成人狀態來梳理它。',
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // Map chat history for backend request
      const formattedHistory = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

      const heronReplyText = await sendHeronChatMessage(formattedHistory, userMsgText);

      const heronMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'heron',
        text: heronReplyText,
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, heronMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="card-panel rounded-2xl p-4 flex items-center justify-between border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <span>蒼鷺隨身對話診室</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs muted-text">基於交流分析（TA）理論，以客觀、包容的成人視角陪伴引導</p>
          </div>
        </div>
      </div>

      {/* Message History Box */}
      <div className="card-panel rounded-3xl p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 border border-white/10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : '🪶'}
            </div>

            <div
              className={`max-w-[82%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30 rounded-tr-none font-sans'
                  : 'bg-white/5 text-white/95 border border-white/10 rounded-tl-none font-serif'
              }`}
            >
              <p>{msg.text}</p>
              <span className="block text-[10px] opacity-40 mt-1.5 text-right">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs">
              🪶
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs muted-text flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
              <span>蒼鷺醫生正凝神思索對話...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="向蒼鷺醫生描述你當前的焦慮或當機想法..."
          className="flex-1 p-3.5 rounded-2xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="custom-button px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-slate-950" />
          <span className="hidden sm:inline">傳送</span>
        </button>
      </form>
    </div>
  );
};
