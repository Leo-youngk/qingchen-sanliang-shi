"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Dumbbell, Footprints, Home, Languages } from "lucide-react";
import { ACTION_CONFIG } from "@/lib/types";
import type { ActionType } from "@/lib/types";

const actionIcons: Record<ActionType, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  reading: BookOpen,
  exercise: Dumbbell,
  walking: Footprints,
  cleaning: Home,
  english: Languages,
};

export default function ActionPage() {
  const router = useRouter();
  return (
    <div className="space-y-7 pt-2">
      <div className="mb-8">
        <h1 className="text-[21px] font-semibold text-[#20201D] tracking-wide">
          换一个小行动
        </h1>
        <p className="text-[15px] text-[#7A756B] mt-2 tracking-wide">
          不用做很多，做一点就够了。
        </p>
      </div>

      <div className="space-y-3.5">
        {(Object.entries(ACTION_CONFIG) as [ActionType, typeof ACTION_CONFIG[ActionType]][]).map(
          ([type, config]) => {
            const Icon = actionIcons[type];
            return (
              <button
                key={type}
                onClick={() => router.push(`/action/${type}`)}
                className="w-full bg-[#FFFCF6] rounded-2xl border border-[#E4DCCF]/80 p-4.5 flex items-center gap-4 hover:border-[#A58E6F]/50 active:scale-[0.98] transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3E5C4A]/8 flex items-center justify-center shrink-0">
                  <Icon size={23} strokeWidth={1.5} className="text-[#3E5C4A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[17px] font-medium text-[#20201D] tracking-wide">
                    {config.label}
                  </span>
                  <p className="text-[14px] text-[#7A756B] mt-1 tracking-wide">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
