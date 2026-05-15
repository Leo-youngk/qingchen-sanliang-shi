"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPreviewForDate,
  getOrCreateTodayRecord,
  saveTodayTasks,
  getRecord,
  getTodayKey,
} from "@/lib/cloudStorage";
import type { DailyRecord } from "@/lib/types";

export default function TodayPage() {
  const [mounted, setMounted] = useState(false);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [tasks, setTasks] = useState(["", "", ""]);
  const [isEditing, setIsEditing] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const todayKey = getTodayKey();

    Promise.all([getRecord(todayKey), getPreviewForDate(todayKey)])
      .then(([todayRecord, preview]) => {
        if (todayRecord) {
          setTasks([
            todayRecord.topThreeTasks[0] || "",
            todayRecord.topThreeTasks[1] || "",
            todayRecord.topThreeTasks[2] || "",
          ]);
          const hasTasks = todayRecord.topThreeTasks.some((t) => t.trim());
          setIsEditing(!hasTasks);
          setSaved(hasTasks);
          setRecord(todayRecord);
        } else {
          // No record yet — pre-fill from yesterday's preview if available
          if (preview && preview.tomorrowTasks.some((t) => t.trim())) {
            setTasks([
              preview.tomorrowTasks[0] || "",
              preview.tomorrowTasks[1] || "",
              preview.tomorrowTasks[2] || "",
            ]);
          }
          // Create record in background, don't block UI
          getOrCreateTodayRecord()
            .then((newRecord) => setRecord(newRecord))
            .catch(() => {
              // Silent fail — user can still use the form, save will create the record
            });
        }
      })
      .catch(() => {
        // Supabase unreachable — show empty edit form, let user proceed
      });
  }, []);

  const handleSave = useCallback(() => {
    const filledTasks = tasks.map((t) => t.trim());
    saveTodayTasks(filledTasks)
      .then((updated) => {
        setRecord(updated);
        setSaved(true);
        setIsEditing(false);
      })
      .catch(console.error);
  }, [tasks]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const d = new Date();
  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const dateStr = mounted
    ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`
    : "";

  const pauseCount = record?.pauses.length ?? 0;
  const switchCount =
    record?.pauses.filter((p) => p.choice === "switch").length ?? 0;

  return (
    <div className="animate-in fade-in duration-300">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border-[2.5px] border-[#3E5C4A] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#3E5C4A]" />
          </div>
          <span className="text-[19px] font-semibold tracking-wide text-[#20201D]">
            归位
          </span>
        </div>
        <span suppressHydrationWarning className="text-sm text-[#7A756B] tracking-wide">{dateStr}</span>
      </div>

      {/* 核心问题 */}
      {isEditing ? (
        <div className="space-y-8">
          <div>
            <h1 className="text-[23px] font-semibold leading-snug text-[#20201D] tracking-wide">
              我今天最重要的三件事情是什么？
            </h1>
          </div>

          {/* 输入框 */}
          <div className="space-y-5 mt-8">
            {tasks.map((task, i) => (
              <div key={i} className="relative">
                <span className="absolute left-0 top-3.5 text-[14px] text-[#A58E6F] font-medium tracking-wider">
                  {["一", "二", "三"][i]}、
                </span>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => {
                    const next = [...tasks];
                    next[i] = e.target.value;
                    setTasks(next);
                  }}
                  placeholder={`输入第${["一", "二", "三"][i]}件最重要的事...`}
                  className="w-full pl-7 pr-4 py-3.5 text-[16px] text-[#20201D] bg-transparent border-b border-[#E4DCCF] placeholder:text-[#B8B0A4] placeholder:text-[15px] transition-colors focus:border-[#A58E6F] tracking-wide"
                />
              </div>
            ))}
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={!tasks.some((t) => t.trim())}
            className="mt-10 w-full py-3.5 rounded-2xl bg-[#3E5C4A] text-white font-medium tracking-widest text-[16px] hover:bg-[#3E5C4A]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            保存今日
          </button>
        </div>
      ) : (
        /* 已保存状态 */
        <div className="space-y-8">
          <div>
            <h2 className="text-[17px] font-semibold text-[#3E5C4A] tracking-wide">
              今日三件事
            </h2>
          </div>

          <div className="bg-[#FFFCF6] rounded-2xl border border-[#E4DCCF]/80 p-6 space-y-4">
            {record?.topThreeTasks.map((task, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[14px] text-[#A58E6F] font-medium mt-0.5 shrink-0">
                  {["一", "二、", "三、"][i]}
                </span>
                <span className="text-[16px] text-[#20201D] tracking-wide leading-relaxed">
                  {task || "—"}
                </span>
              </div>
            ))}
          </div>

          {/* 今日状态 */}
          <div className="flex items-center gap-2 text-[14px] text-[#7A756B] tracking-wide flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#3E5C4A]/50" />
              已定向
            </span>
            <span className="text-[#E4DCCF]">·</span>
            <span>
              暂停{" "}
              <span className="font-semibold text-[#20201D]">{pauseCount}</span>{" "}
              次
            </span>
            <span className="text-[#E4DCCF]">·</span>
            <span>
              回到行动{" "}
              <span className="font-semibold text-[#20201D]">{switchCount}</span>{" "}
              次
            </span>
          </div>

          {/* 编辑按钮 */}
          <button
            onClick={handleEdit}
            className="text-[14px] text-[#7A756B] tracking-wide hover:text-[#3E5C4A] transition-colors underline underline-offset-4 decoration-[#E4DCCF]"
          >
            编辑今日
          </button>
        </div>
      )}
    </div>
  );
}
