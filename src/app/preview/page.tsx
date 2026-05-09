"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon } from "lucide-react";
import { getTomorrowKey, saveTomorrowPreview, getPreviewForDate } from "@/lib/storage";
import type { TomorrowPreview } from "@/lib/types";

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState(["", "", ""]);
  const [failures, setFailures] = useState(["", "", ""]);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    setMounted(true);
    const tomorrowKey = getTomorrowKey();
    const existing = getPreviewForDate(tomorrowKey);
    if (existing) {
      setTasks([
        existing.tomorrowTasks[0] || "",
        existing.tomorrowTasks[1] || "",
        existing.tomorrowTasks[2] || "",
      ]);
      setFailures([
        existing.possibleFailures[0] || "",
        existing.possibleFailures[1] || "",
        existing.possibleFailures[2] || "",
      ]);
      setSaved(true);
      setIsEditing(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    const tomorrowKey = getTomorrowKey();
    const preview: TomorrowPreview = {
      targetDate: tomorrowKey,
      tomorrowTasks: tasks.map((t) => t.trim()),
      possibleFailures: failures.map((f) => f.trim()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTomorrowPreview(preview);
    setSaved(true);
    setIsEditing(false);
  }, [tasks, failures]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      {/* 顶部 */}
      <div className="flex items-center gap-2.5 mb-3">
        <Moon size={21} strokeWidth={1.5} className="text-[#3E5C4A]" />
        <h1 className="text-[20px] font-semibold text-[#20201D] tracking-wide">
          明日预演
        </h1>
      </div>

      {!saved || isEditing ? (
        /* 编辑模式 */
        <div className="space-y-10">
          {/* 第一部分：明天想完成的事 */}
          <div>
            <h2 className="text-[16px] font-medium text-[#20201D] tracking-wide mb-5">
              明天我想完成的三件事情
            </h2>
            <div className="space-y-4">
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
                    placeholder={`输入第${["一", "二", "三"][i]}件事...`}
                    className="w-full pl-7 pr-4 py-3.5 text-[16px] text-[#20201D] bg-transparent border-b border-[#E4DCCF] placeholder:text-[#B8B0A4] placeholder:text-[15px] focus:border-[#A58E6F] transition-colors tracking-wide"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 第二部分：可能失败的原因 */}
          <div>
            <h2 className="text-[16px] font-medium text-[#20201D] tracking-wide mb-5">
              它们可能会因为什么失败？
            </h2>
            <div className="space-y-4">
              {failures.map((failure, i) => (
                <div key={i} className="relative">
                  <span className="absolute left-0 top-3.5 text-[14px] text-[#A58E6F] font-medium tracking-wider">
                    {["一", "二", "三"][i]}、
                  </span>
                  <input
                    type="text"
                    value={failure}
                    onChange={(e) => {
                      const next = [...failures];
                      next[i] = e.target.value;
                      setFailures(next);
                    }}
                    placeholder={`可能失败的原因${i + 1}`}
                    className="w-full pl-7 pr-4 py-3.5 text-[16px] text-[#20201D] bg-transparent border-b border-[#E4DCCF] placeholder:text-[#B8B0A4] placeholder:text-[15px] focus:border-[#A58E6F] transition-colors tracking-wide"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={
              !tasks.some((t) => t.trim()) && !failures.some((f) => f.trim())
            }
            className="mt-8 w-full py-3.5 rounded-2xl bg-[#3E5C4A] text-white font-medium tracking-widest text-[16px] hover:bg-[#3E5C4A]/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存明日预演
          </button>
        </div>
      ) : (
        /* 已保存模式 */
        <div className="space-y-7">
          {/* 明天想完成的事 */}
          <div className="bg-[#FFFCF6] rounded-2xl border border-[#E4DCCF]/80 p-6 space-y-4">
            <h3 className="text-[15px] font-medium text-[#3E5C4A] tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E5C4A]" />
              明天我想完成的三件事情
            </h3>
            {tasks.map((task, i) => (
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

          {/* 可能失败原因 */}
          <div className="bg-[#FFFCF6] rounded-2xl border border-[#E4DCCF]/80 p-6 space-y-4">
            <h3 className="text-[15px] font-medium text-[#A58E6F] tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A58E6F]" />
              它们可能会因为什么失败？
            </h3>
            {failures.map((failure, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[14px] text-[#7A756B] font-medium mt-0.5 shrink-0">
                  {["一", "二、", "三、"][i]}
                </span>
                <span className="text-[15px] text-[#7A756B] tracking-wide leading-relaxed">
                  {failure || "—"}
                </span>
              </div>
            ))}
          </div>

          {/* 编辑 */}
          <button
            onClick={handleEdit}
            className="text-[14px] text-[#7A756B] tracking-wide hover:text-[#3E5C4A] transition-colors underline underline-offset-4 decoration-[#E4DCCF]"
          >
            编辑预演
          </button>
        </div>
      )}
    </div>
  );
}
