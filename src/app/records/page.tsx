"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollText, ChevronDown, ChevronUp, CheckCircle2, Circle, Sun, Moon } from "lucide-react";
import { getAllRecords } from "@/lib/cloudStorage";
import type { DailyRecord } from "@/lib/types";

function formatDate(dateKey: string): string {
  const d = new Date(dateKey + "T00:00:00");
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
}

export default function RecordsPage() {
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    getAllRecords()
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!mounted || loading) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex items-center gap-2.5">
        <ScrollText size={21} strokeWidth={1.5} className="text-[#3E5C4A]" />
        <h1 className="text-[20px] font-semibold text-[#20201D] tracking-wide">
          记录
        </h1>
      </div>

      {/* 记录列表 */}
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[16px] text-[#7A756B] tracking-wide">还没有记录。</p>
          <p className="text-[14px] text-[#B8B0A4] mt-1 tracking-wide">今天开始就好。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const isExpanded = expandedIds.has(record.date);
            const completedActions = record.actions.filter((a) => a.completed);
            const pauseCount = record.pauses.length;
            const switchCount = record.pauses.filter(
              (p) => p.choice === "switch"
            ).length;

            return (
              <div
                key={record.date}
                className="bg-[#FFFCF6] rounded-2xl border border-[#E4DCCF]/80 overflow-hidden"
              >
                {/* 卡片头部 */}
                <button
                  onClick={() => toggleExpand(record.date)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-[16px] font-medium text-[#20201D] tracking-wide">
                    {formatDate(record.date)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={18} strokeWidth={1.5} className="text-[#7A756B] shrink-0" />
                  ) : (
                    <ChevronDown size={18} strokeWidth={1.5} className="text-[#7A756B] shrink-0" />
                  )}
                </button>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="px-5 pb-6 space-y-5 border-t border-[#E4DCCF]/50 pt-5">
                    {/* 今日三件事 */}
                    {record.topThreeTasks.some((t) => t.trim()) && (
                      <div>
                        <h3 className="text-[13px] font-medium text-[#3E5C4A] tracking-wide mb-3 flex items-center gap-2">
                          <CheckCircle2 size={14} strokeWidth={1.8} className="text-[#3E5C4A]" />
                          今日三件事
                        </h3>
                        <div className="space-y-2 ml-5">
                          {record.topThreeTasks.map(
                            (task, i) =>
                              task.trim() && (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-[13px] text-[#A58E6F] mt-0.5 shrink-0">
                                    {["一", "二、", "三、"][i]}
                                  </span>
                                  <span className="text-[15px] text-[#20201D] leading-relaxed">
                                    {task}
                                  </span>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )}

                    {/* 今日状态 */}
                    {pauseCount > 0 && (
                      <div>
                        <h3 className="text-[13px] font-medium text-[#7A756B] tracking-wide mb-3 flex items-center gap-2">
                          <Circle size={14} strokeWidth={1.8} className="text-[#7A756B]" />
                          今日状态
                        </h3>
                        <p className="text-[14px] text-[#7A756B] tracking-wide ml-5">
                          已定向 · 暂停{" "}
                          <span className="font-semibold text-[#20201D]">
                            {pauseCount}
                          </span>{" "}
                          次 · 回到行动{" "}
                          <span className="font-semibold text-[#20201D]">
                            {switchCount}
                          </span>{" "}
                          次
                        </p>
                      </div>
                    )}

                    {/* 完成的行动 */}
                    {completedActions.length > 0 && (
                      <div>
                        <h3 className="text-[13px] font-medium text-[#3E5C4A] tracking-wide mb-3 flex items-center gap-2">
                          <CheckCircle2 size={14} strokeWidth={1.8} className="text-[#3E5C4A]" />
                          完成的行动
                        </h3>
                        <div className="space-y-2 ml-5">
                          {completedActions.map((action) => (
                            <div key={action.id} className="flex items-center gap-2">
                              <span className="text-[14px] text-[#20201D]">
                                {action.label}
                              </span>
                              {action.completedAt && (
                                <span className="text-[12px] text-[#7A756B]">
                                  {new Date(action.completedAt).toLocaleTimeString("zh-CN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 明日预演 */}
                    {record.previewForTomorrow &&
                      (record.previewForTomorrow.tomorrowTasks.some((t) =>
                        t.trim()
                      ) ||
                        record.previewForTomorrow.possibleFailures.some((f) =>
                          f.trim()
                        )) && (
                        <div>
                          <h3 className="text-[13px] font-medium text-[#A58E6F] tracking-wide mb-3 flex items-center gap-2">
                            <Moon size={14} strokeWidth={1.8} className="text-[#A58E6F]" />
                            明日预演
                          </h3>
                          <div className="ml-5 space-y-3">
                            {record.previewForTomorrow.tomorrowTasks.some((t) =>
                              t.trim()
                            ) && (
                              <div className="space-y-1.5">
                                <span className="text-[12px] text-[#7A756B] tracking-wide">
                                  明天想完成：
                                </span>
                                {record.previewForTomorrow.tomorrowTasks.map(
                                  (task, i) =>
                                    task.trim() && (
                                        <div
                                          key={i}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="text-[12px] text-[#A58E6F] mt-0.5">
                                            {["一", "二、", "三、"][i]}
                                          </span>
                                          <span className="text-[14px] text-[#20201D]">
                                            {task}
                                          </span>
                                        </div>
                                      )
                                )}
                              </div>
                            )}
                            {record.previewForTomorrow.possibleFailures.some((f) =>
                              f.trim()
                            ) && (
                              <div className="space-y-1.5">
                                <span className="text-[12px] text-[#7A756B] tracking-wide">
                                  可能失败：
                                </span>
                                {record.previewForTomorrow.possibleFailures.map(
                                  (failure, i) =>
                                    failure.trim() && (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2"
                                      >
                                        <span className="text-[12px] text-[#7A756B] mt-0.5">
                                          {["一", "二、", "三、"][i]}
                                        </span>
                                        <span className="text-[14px] text-[#7A756B]">
                                          {failure}
                                        </span>
                                      </div>
                                    )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
