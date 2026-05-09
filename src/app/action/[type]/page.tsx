"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ACTION_CONFIG, ActionType } from "@/lib/types";
import { addActionRecord } from "@/lib/cloudStorage";

const VALID_TYPES: ActionType[] = ["reading", "exercise", "walking", "cleaning", "english"];

const ACTION_MESSAGES: Record<ActionType, { title: string; subtitle: string }> = {
  reading: {
    title: "现在去读书。",
    subtitle: "不用读很多，读一页就行。",
  },
  exercise: {
    title: "现在做一组动作。",
    subtitle: "不用完整训练，先让身体动起来。",
  },
  walking: {
    title: "现在出去走一圈。",
    subtitle: "不需要目的地，只是让注意力换口气。",
  },
  cleaning: {
    title: "现在整理一小块地方。",
    subtitle: "不用收拾整个房间，只处理眼前这一小块。",
  },
  english: {
    title: "现在学一点英语。",
    subtitle: "读一句，听一分钟，或者背一个词。",
  },
};

export default function ActionReminderPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const isValid = VALID_TYPES.includes(type as ActionType);
  const config = isValid ? ACTION_CONFIG[type as ActionType] : null;
  const messages = isValid ? ACTION_MESSAGES[type as ActionType] : null;

  const [mounted, setMounted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleComplete = useCallback(async () => {
    if (!config) return;
    setSaving(true);
    try {
      await addActionRecord({
        type: type as ActionType,
        label: config.label,
        completed: true,
        completedAt: new Date().toISOString(),
      });
      setIsCompleted(true);
    } catch (error) {
      console.error("Failed to save action:", error);
    } finally {
      setSaving(false);
    }
  }, [config, type]);

  const handleSkip = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleBackToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  if (!isValid || !config || !messages) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-[#7A756B]">未知行动类型</p>
        <button onClick={() => router.push("/action")} className="mt-4 text-[#3E5C4A] underline">
          返回选择
        </button>
      </div>
    );
  }

  // 完成状态
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-7">
        <div className="w-20 h-20 rounded-full bg-[#3E5C4A]/10 flex items-center justify-center">
          <CheckCircle2 size={36} strokeWidth={1.5} className="text-[#3E5C4A]" />
        </div>
        <div className="space-y-2">
          <p className="text-[21px] font-semibold text-[#20201D] tracking-wide">
            已记录。
          </p>
          <p className="text-[16px] text-[#3E5C4A] tracking-wide">
            你刚刚把注意力带回来了一次。
          </p>
        </div>

        <button
          onClick={handleBackToHome}
          className="mt-6 px-10 py-3.5 rounded-2xl bg-[#3E5C4A] text-white font-medium tracking-widest text-[16px] hover:bg-[#3E5C4A]/90 active:scale-[0.98] transition-all"
        >
          回到今日
        </button>
      </div>
    );
  }

  // 提醒状态
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-10">
      {/* 返回 */}
      <button
        onClick={() => router.push("/action")}
        className="absolute top-4 left-4 p-2 text-[#7A756B] hover:text-[#20201D] transition-colors"
      >
        <ArrowLeft size={21} strokeWidth={1.5} />
      </button>

      {/* 圆环视觉 */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full border-[2.5px] border-[#3E5C4A]/25 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#3E5C4A]/70" />
        </div>
      </div>

      {/* 提醒文案 */}
      <div className="space-y-3 max-w-[300px]">
        <h1 className="text-[23px] font-semibold text-[#20201D] leading-relaxed tracking-wide">
          {messages.title}
        </h1>
        <p className="text-[16px] text-[#7A756B] leading-relaxed tracking-wide">
          {messages.subtitle}
        </p>
      </div>

      {/* 按钮 */}
      <div className="w-full max-w-[300px] space-y-3.5 mt-8">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-[#3E5C4A] text-white font-medium tracking-widest text-[16px] hover:bg-[#3E5C4A]/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-wait"
        >
          {saving ? "保存中..." : "我做完了"}
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-3.5 rounded-2xl border border-[#E4DCCF] text-[#7A756B] font-medium tracking-widest text-[16px] hover:border-[#A58E6F] hover:text-[#20201D] active:scale-[0.98] transition-all"
        >
          先不记录
        </button>
      </div>
    </div>
  );
}
