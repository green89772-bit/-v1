import React, { useState } from 'react';
import { Volume2, VolumeX, MessageSquareText, History, LifeBuoy, BookOpen, Flame, CloudRain, Wind, Sparkles } from 'lucide-react';
import { AppTheme, AmbientSoundType } from '../types';
import { ambientAudio } from '../utils/audioSynth';

interface Props {
  activeTab: 'sos' | 'history' | 'library' | 'chat';
  setActiveTab: (tab: 'sos' | 'history' | 'library' | 'chat') => void;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  isPlayingAudio: boolean;
  setIsPlayingAudio: (p: boolean) => void;
  ambientType: AmbientSoundType;
  setAmbientType: (t: AmbientSoundType) => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  isPlayingAudio,
  setIsPlayingAudio,
  ambientType,
  setAmbientType,
}) => {
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const handleToggleAudio = () => {
    const newState = ambientAudio.toggle(ambientType);
    setIsPlayingAudio(newState);
  };

  const handleSelectSoundType = (type: AmbientSoundType) => {
    setAmbientType(type);
    ambientAudio.setType(type);
    if (!isPlayingAudio) {
      ambientAudio.start(type);
      setIsPlayingAudio(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    ambientAudio.setVolume(v);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-white/10 bg-black/20 text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: App Identity */}
        <button
          onClick={() => setActiveTab('sos')}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-emerald-300 group-hover:bg-white/20 transition-all">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-wide block leading-tight">
              蒼鷺隨身診室
            </span>
            <span className="text-[11px] opacity-70 tracking-wider">待業與當機急救站</span>
          </div>
        </button>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('sos')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'sos'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LifeBuoy className="w-4 h-4 text-amber-400" />
            <span>急救 SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">歷史紀錄</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'library'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">心靈圖書室</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquareText className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">蒼鷺對話</span>
          </button>
        </nav>

        {/* Right: Audio Synth & Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Audio Synthesizer Popover */}
          <div className="relative">
            <button
              onClick={() => setShowAudioMenu(!showAudioMenu)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
                isPlayingAudio
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
              title="療癒白噪音切換"
            >
              {isPlayingAudio ? (
                <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-60" />
              )}
              <span className="hidden md:inline">
                {ambientType === 'fireplace' ? '壁爐聲' : ambientType === 'rain' ? '靜謐雨' : '森林風'}
              </span>
            </button>

            {/* Audio Controls Dropdown */}
            {showAudioMenu && (
              <div className="absolute right-0 mt-2 w-56 p-3 rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl backdrop-blur-xl z-50 text-white text-xs space-y-3">
                <div className="flex items-center justify-between font-semibold border-b border-white/10 pb-2">
                  <span>自然白噪音切換</span>
                  <button
                    onClick={handleToggleAudio}
                    className={`px-2 py-1 rounded text-[11px] ${
                      isPlayingAudio ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {isPlayingAudio ? '暫停' : '播放'}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSelectSoundType('fireplace')}
                    className={`w-full p-2 rounded-xl flex items-center gap-2 transition-colors ${
                      ambientType === 'fireplace' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>木屋壁爐柴火聲</span>
                  </button>

                  <button
                    onClick={() => handleSelectSoundType('rain')}
                    className={`w-full p-2 rounded-xl flex items-center gap-2 transition-colors ${
                      ambientType === 'rain' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <CloudRain className="w-4 h-4 text-cyan-400" />
                    <span>靜謐角落小雨聲</span>
                  </button>

                  <button
                    onClick={() => handleSelectSoundType('breeze')}
                    className={`w-full p-2 rounded-xl flex items-center gap-2 transition-colors ${
                      ambientType === 'breeze' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <Wind className="w-4 h-4 text-emerald-400" />
                    <span>森林樹梢微風聲</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>音量調節</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-amber-400 h-1 bg-white/20 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTheme('sage')}
              title="晨曦鼠尾草綠 (Sage)"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'sage'
                  ? 'bg-emerald-600/60 text-emerald-200 ring-1 ring-emerald-400/50 shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🌿
            </button>
            <button
              onClick={() => setTheme('amber')}
              title="木屋柴火暖琥珀 (Amber)"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'amber'
                  ? 'bg-amber-600/60 text-amber-200 ring-1 ring-amber-400/50 shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🪵
            </button>
            <button
              onClick={() => setTheme('deep_ocean')}
              title="深海微光藍 (Deep Ocean)"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'deep_ocean'
                  ? 'bg-blue-600/60 text-blue-200 ring-1 ring-blue-400/50 shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🌊
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
