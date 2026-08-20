import React, { useState, useEffect } from 'react';
import { AppTheme, AmbientSoundType, EmergencyResetLog, ChapterUserResponse } from './types';
import { Navbar } from './components/Navbar';
import { EmergencyResetView } from './components/EmergencyResetView';
import { ResetHistoryView } from './components/ResetHistoryView';
import { MindLibraryView } from './components/MindLibraryView';
import { HeronChatView } from './components/HeronChatView';

const RESET_LOGS_STORAGE_KEY = 'heron_sos_reset_logs_v2';
const CHAPTER_RESPONSES_STORAGE_KEY = 'heron_chapter_responses_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sos' | 'history' | 'library' | 'chat'>('sos');
  const [theme, setTheme] = useState<AppTheme>('sage');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [ambientType, setAmbientType] = useState<AmbientSoundType>('fireplace');

  // Emergency Reset Logs State
  const [resetLogs, setResetLogs] = useState<EmergencyResetLog[]>(() => {
    try {
      const saved = localStorage.getItem(RESET_LOGS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Chapter Responses State
  const [chapterResponses, setChapterResponses] = useState<Record<number, ChapterUserResponse>>(() => {
    try {
      const saved = localStorage.getItem(CHAPTER_RESPONSES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save reset logs
  useEffect(() => {
    try {
      localStorage.setItem(RESET_LOGS_STORAGE_KEY, JSON.stringify(resetLogs));
    } catch (e) {
      console.warn('LocalStorage reset logs save error:', e);
    }
  }, [resetLogs]);

  // Save chapter responses
  useEffect(() => {
    try {
      localStorage.setItem(CHAPTER_RESPONSES_STORAGE_KEY, JSON.stringify(chapterResponses));
    } catch (e) {
      console.warn('LocalStorage chapter responses save error:', e);
    }
  }, [chapterResponses]);

  const handleSaveResetLog = (log: EmergencyResetLog) => {
    setResetLogs((prev) => [log, ...prev]);
  };

  const handleClearLogs = () => {
    if (window.confirm('確定要清除所有急救歷程紀錄嗎？')) {
      setResetLogs([]);
      try {
        localStorage.removeItem(RESET_LOGS_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const handleSaveChapterResponse = (resp: ChapterUserResponse) => {
    setChapterResponses((prev) => ({
      ...prev,
      [resp.chapterId]: resp,
    }));
  };

  return (
    <div className={`theme-${theme} app-container flex flex-col min-h-screen selection:bg-amber-400 selection:text-slate-950 font-sans`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        isPlayingAudio={isPlayingAudio}
        setIsPlayingAudio={setIsPlayingAudio}
        ambientType={ambientType}
        setAmbientType={setAmbientType}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'sos' && (
          <EmergencyResetView
            onSaveResetLog={handleSaveResetLog}
            onGoToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <ResetHistoryView
            logs={resetLogs}
            onClearLogs={handleClearLogs}
            onGoToSOS={() => setActiveTab('sos')}
          />
        )}

        {activeTab === 'library' && (
          <MindLibraryView
            theme={theme}
            responses={chapterResponses}
            onSaveResponse={handleSaveChapterResponse}
          />
        )}

        {activeTab === 'chat' && <HeronChatView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs opacity-60 space-y-1">
        <p>《蒼鷺隨身診室》待業與當機急救站 · 交流分析 (TA) 成人狀態導引</p>
        <p className="text-[10px]">所有輸入均全數存於本機 LocalStorage，安心表達不留隱私負擔</p>
      </footer>
    </div>
  );
}
