import React from 'react';
import { History, Trash2, Calendar, Battery, ShieldAlert, Anchor, CheckCircle } from 'lucide-react';
import { EmergencyResetLog } from '../types';

interface Props {
  logs: EmergencyResetLog[];
  onClearLogs: () => void;
  onGoToSOS: () => void;
}

export const ResetHistoryView: React.FC<Props> = ({ logs, onClearLogs, onGoToSOS }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>急救歷程紀錄清單</span>
          </div>
          <h1 className="text-2xl font-bold">歷史急救與認知重構軌跡</h1>
          <p className="text-xs sm:text-sm muted-text">
            這裡紀錄著每一次你選擇停下來、完成體感微任務並重構負面念頭的成人生存事實。
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>清除所有歷史紀錄</span>
          </button>
        )}
      </div>

      {/* Log Entries */}
      {logs.length === 0 ? (
        <div className="card-panel rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto muted-text">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">目前尚無急救紀錄</h3>
            <p className="text-xs muted-text">
              當你感覺當機或焦慮時，隨時點擊「急救 SOS」完成第一次體感重置。
            </p>
          </div>
          <button
            onClick={onGoToSOS}
            className="custom-button px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md"
          >
            <span>立即進行急救 SOS ➔</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="card-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-white/10">
              {/* Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 muted-text font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>{log.timestamp}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 font-medium flex items-center gap-1">
                    <Battery className="w-3 h-3 text-amber-300" />
                    <span>{log.energyLevel}% 電量</span>
                  </span>
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>完成任務：{log.completedTaskTitle}</span>
                </span>
              </div>

              {/* Thought Breakdown details */}
              {log.originalNegativeThought && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-semibold muted-text">
                    💬 原始折磨念頭：「{log.originalNegativeThought}」
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {log.criticalParentAnalysis && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1">
                        <div className="font-bold text-red-300 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>苛刻父母的扭曲審判</span>
                        </div>
                        <p className="text-red-100/90 leading-relaxed font-serif">
                          {log.criticalParentAnalysis}
                        </p>
                      </div>
                    )}

                    {log.adultObjectiveFact && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                        <div className="font-bold text-emerald-300 flex items-center gap-1">
                          <Anchor className="w-3.5 h-3.5" />
                          <span>成人的客觀事實宣告</span>
                        </div>
                        <p className="text-emerald-100/90 leading-relaxed font-serif">
                          {log.adultObjectiveFact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
