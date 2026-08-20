import React, { useState, useEffect } from 'react';
import { Battery, Dices, Timer, CheckCircle, ArrowRight, Sparkles, AlertCircle, Edit3, Save, RefreshCw } from 'lucide-react';
import { EnergyLevel, MicroTask, ThoughtBreakdownResult, EmergencyResetLog } from '../types';
import { PRESET_MICRO_TASKS } from '../data/microTasks';
import { getThoughtBreakdown } from '../utils/gemini';

interface Props {
  onSaveResetLog: (log: EmergencyResetLog) => void;
  onGoToHistory: () => void;
}

export const EmergencyResetView: React.FC<Props> = ({ onSaveResetLog, onGoToHistory }) => {
  // Stage state: 'energy' | 'task' | 'somatic_timer' | 'thought_input' | 'thought_result' | 'done'
  const [stage, setStage] = useState<'energy' | 'task' | 'somatic_timer' | 'thought_input' | 'thought_result' | 'done'>('energy');

  // Stage 1 Data
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(30);
  const [selectedTask, setSelectedTask] = useState<MicroTask | null>(null);
  const [customTaskTitle, setCustomTaskTitle] = useState<string>('');
  const [isEditingCustomTask, setIsEditingCustomTask] = useState<boolean>(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Stage 2 Data
  const [negativeThought, setNegativeThought] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [breakdownResult, setBreakdownResult] = useState<ThoughtBreakdownResult | null>(null);

  // Countdown logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (stage === 'somatic_timer' && timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && stage === 'somatic_timer') {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage, timerRunning, timeLeft]);

  // Select energy and filter tasks
  const handleSelectEnergy = (level: EnergyLevel) => {
    setEnergyLevel(level);
    setStage('task');
  };

  const tasksForEnergy = PRESET_MICRO_TASKS.filter((t) => t.energyReq === energyLevel);

  // Random surprise selection
  const handleRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * tasksForEnergy.length);
    handleSelectTask(tasksForEnergy[randomIndex]);
  };

  const handleSelectTask = (task: MicroTask) => {
    setSelectedTask(task);
    setTimeLeft(120);
    setTimerRunning(true);
    setStage('somatic_timer');
  };

  const handleSelectCustomTask = () => {
    const custom: MicroTask = {
      id: 'custom-task',
      title: customTaskTitle.trim() || '進行私人專屬舒緩小事',
      description: '執行你自己平時最能獲得安寧的極低門檻微任務。',
      category: 'care',
      energyReq: energyLevel,
      iconName: 'sparkles',
      isCustom: true,
    };
    handleSelectTask(custom);
  };

  // Complete somatic reset stage -> proceed to thought breakdown
  const handleSomaticDone = () => {
    setTimerRunning(false);
    setStage('thought_input');
  };

  // Run AI Thought Breakdown
  const handleAnalyzeThought = async () => {
    if (!negativeThought.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await getThoughtBreakdown(negativeThought.trim());
      setBreakdownResult(result);
      setStage('thought_result');
    } catch (err) {
      console.error('Error in thought analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Final Save to History
  const handleFinalSave = () => {
    if (!selectedTask) return;

    const log: EmergencyResetLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      energyLevel,
      completedTaskTitle: selectedTask.title,
      originalNegativeThought: negativeThought.trim() || undefined,
      criticalParentAnalysis: breakdownResult?.criticalParent,
      adultObjectiveFact: breakdownResult?.adultFact,
    };

    onSaveResetLog(log);
    setStage('done');
  };

  const handleResetAll = () => {
    setStage('energy');
    setSelectedTask(null);
    setNegativeThought('');
    setBreakdownResult(null);
    setTimeLeft(120);
    setTimerRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/15 accent-text shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          <span>兩階段急救：先體感破局 ➔ 後想法拆解</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          當機與焦慮緊急處方站
        </h1>
        <p className="text-sm sm:text-base muted-text max-w-xl mx-auto leading-relaxed">
          當你處於待業低潮或腦袋當機逃避時，不需要強迫自己完成大目標。跟隨三個步驟，完成 2 分鐘實體微任務，再拆解背後的負向想法。
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto px-2">
        <div className={`flex items-center gap-2 ${stage === 'energy' || stage === 'task' || stage === 'somatic_timer' ? 'accent-text font-bold' : 'opacity-50'}`}>
          <div className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs">1</div>
          <span className="text-xs sm:text-sm">第一階段：體感破局</span>
        </div>

        <div className="h-0.5 flex-1 mx-4 bg-white/10" />

        <div className={`flex items-center gap-2 ${stage === 'thought_input' || stage === 'thought_result' || stage === 'done' ? 'accent-text font-bold' : 'opacity-50'}`}>
          <div className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs">2</div>
          <span className="text-xs sm:text-sm">第二階段：急救打字箱</span>
        </div>
      </div>

      {/* STAGE 1: Step 1 - Energy Detection */}
      {stage === 'energy' && (
        <div className="card-panel rounded-3xl p-6 sm:p-10 space-y-8 text-center shadow-xl animate-fadeIn">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Battery className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">檢測當前電量狀態</h2>
            <p className="text-xs sm:text-sm muted-text">
              請坦率地面對當下的體感，你現在腦袋或身體還剩多少精力？
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleSelectEnergy(10)}
              className="card-panel card-panel-hover p-5 rounded-2xl text-left space-y-3 group border border-white/10 transition-all hover:scale-102"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                  10% 電量
                </span>
                <span className="text-xl">🪫</span>
              </div>
              <div>
                <h3 className="font-bold text-base">極度沒電 / 當機癱瘓</h3>
                <p className="text-xs muted-text mt-1">連站起來都覺得累，只想躺著或坐著放空。</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectEnergy(30)}
              className="card-panel card-panel-hover p-5 rounded-2xl text-left space-y-3 group border border-white/10 transition-all hover:scale-102"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  30% 電量
                </span>
                <span className="text-xl">🔋</span>
              </div>
              <div>
                <h3 className="font-bold text-base">微弱電量 / 稍微卡住</h3>
                <p className="text-xs muted-text mt-1">可以起身伸手，但無法進行高強度思考。</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectEnergy(50)}
              className="card-panel card-panel-hover p-5 rounded-2xl text-left space-y-3 group border border-white/10 transition-all hover:scale-102"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  50% 電量
                </span>
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h3 className="font-bold text-base">有一些精力 / 日常照顧</h3>
                <p className="text-xs muted-text mt-1">可以做點實體微照顧，為空間或自己洗心革面。</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 1: Step 2 - Micro Task Selection Cards */}
      {stage === 'task' && (
        <div className="card-panel rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block mb-2">
                當前電量：{energyLevel}%
              </span>
              <h2 className="text-xl sm:text-2xl font-bold">選擇一個 2 分鐘低負荷任務</h2>
              <p className="text-xs sm:text-sm muted-text">
                不用追求完美，這不是工作考核，這是正當的神經系統急救與重置。
              </p>
            </div>

            <button
              onClick={handleRandomCard}
              className="custom-button px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg"
            >
              <Dices className="w-4 h-4" />
              <span>🎲 驚喜隨機抽卡</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tasksForEnergy.map((task) => (
              <div
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className="card-panel card-panel-hover p-5 rounded-2xl space-y-3 cursor-pointer group flex flex-col justify-between border border-white/10 hover:border-amber-400/50 transition-all hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 muted-text font-medium">
                      {task.category === 'sensory' ? '感官體驗' : task.category === 'somatic' ? '身體調節' : '生活照顧'}
                    </span>
                    <span className="text-xs accent-text group-hover:translate-x-1 transition-transform">
                      選擇 ➔
                    </span>
                  </div>
                  <h3 className="font-bold text-base group-hover:accent-text transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs muted-text leading-relaxed">
                    {task.description}
                  </p>
                </div>
                <div className="pt-2 text-[11px] opacity-60">⏱ 耗時：約 2 分鐘</div>
              </div>
            ))}
          </div>

          {/* Private Custom Task Section */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold muted-text flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>私人專屬舒緩小事（自訂選項）</span>
              </span>
              {!isEditingCustomTask && (
                <button
                  onClick={() => setIsEditingCustomTask(true)}
                  className="text-xs text-amber-300 hover:underline"
                >
                  修改自訂項目
                </button>
              )}
            </div>

            {isEditingCustomTask ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  placeholder="輸入你平時做了會舒服的小事（例：摸貓、聽一首歌、喝花草茶）"
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => setIsEditingCustomTask(false)}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-medium"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={handleSelectCustomTask}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="text-xs font-medium">
                  {customTaskTitle.trim() ? customTaskTitle : '💡 輸入平時適合你的私人舒緩習慣'}
                </div>
                <span className="text-xs text-amber-300">執行此私房任務 ➔</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 1: Step 3 - Somatic Reset 120s Timer */}
      {stage === 'somatic_timer' && selectedTask && (
        <div className="card-panel rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl animate-fadeIn">
          <div className="max-w-md mx-auto space-y-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              進行中微任務
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">{selectedTask.title}</h2>
            <p className="text-xs sm:text-sm muted-text leading-relaxed">
              {selectedTask.description}
            </p>
          </div>

          {/* Pulsating Breathing Pulse Circle */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/30 pulse-animation" />
            <div className="relative z-10 space-y-1">
              <div className="text-3xl sm:text-5xl font-mono font-bold tracking-tight accent-text">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-xs opacity-70">跟隨呼吸步調放鬆</div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSomaticDone}
              className="custom-button px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl hover:scale-105"
            >
              <CheckCircle className="w-5 h-5 text-slate-950" />
              <span>我完成了，進入下一階段（想法拆解）</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: Thought Input (急救打字箱) */}
      {stage === 'thought_input' && (
        <div className="card-panel rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl animate-fadeIn">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>第一階段體感重置完成</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">第二階段：急救打字箱（認知重構）</h2>
            <p className="text-xs sm:text-sm muted-text">
              身體已經稍獲放鬆。現在，請把剛才折磨你或讓你當機的那句最毒的負面念頭打出來。
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              value={negativeThought}
              onChange={(e) => setNegativeThought(e.target.value)}
              rows={4}
              placeholder="例如：「我今天又沒寫履歷，大家都超越我了，我是個失敗者...」"
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs opacity-60 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>AI 蒼鷺醫生將協助你以「苛刻父母 vs 成人事實」雙欄進行客觀拆解</span>
              </span>

              <button
                onClick={handleAnalyzeThought}
                disabled={!negativeThought.trim() || isAnalyzing}
                className="w-full sm:w-auto custom-button px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>蒼鷺醫生解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>一鍵 AI 雙欄診斷</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: Thought Result Dual-Column Diagnosis Card */}
      {stage === 'thought_result' && breakdownResult && (
        <div className="card-panel rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl animate-fadeIn">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              認知重構對照卡
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">蒼鷺醫生的雙欄診斷</h2>
          </div>

          {/* Dual Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Critical Parent */}
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-3">
              <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                <span className="p-1.5 rounded-lg bg-red-500/20">⚖️</span>
                <span>苛刻父母的審判與扭曲</span>
              </div>
              <p className="text-xs sm:text-sm text-red-100/90 leading-relaxed font-serif">
                {breakdownResult.criticalParent}
              </p>
            </div>

            {/* Right Column: Adult Objective Fact */}
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <span className="p-1.5 rounded-lg bg-emerald-500/20">⚓</span>
                <span>成人的客觀事實宣告</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-serif">
                {breakdownResult.adultFact}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleFinalSave}
              className="w-full sm:w-auto custom-button px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>保存至歷史紀錄並完成</span>
            </button>
          </div>
        </div>
      )}

      {/* DONE Screen */}
      {stage === 'done' && (
        <div className="card-panel rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">神經系統與心智已成功重置！</h2>
            <p className="text-xs sm:text-sm muted-text max-w-md mx-auto">
              你剛才完成了一個 2 分鐘體感微任務，並將折磨你的思想重構為成人的客觀事實。紀錄已成功保存。
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGoToHistory}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            >
              <span>查看歷程清單</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetAll}
              className="custom-button px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>再進行一次急救</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
