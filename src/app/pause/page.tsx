"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addPauseRecord } from "@/lib/storage";

export default function PausePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = () => {
    addPauseRecord("continue");
    router.push("/");
  };

  const handleSwitch = () => {
    addPauseRecord("switch");
    router.push("/action");
  };

  if (!mounted) {
    return <div className="min-h-[60vh]" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* 圆环视觉 */}
      <div className="mb-12">
        <div className="w-28 h-28 rounded-full border-[2.5px] border-[#3E5C4A]/25 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#3E5C4A]/70" />
        </div>
      </div>

      {/* 核心问题 */}
      <h1 className="text-[23px] font-semibold text-[#20201D] leading-relaxed tracking-wide max-w-[280px]">
        如果五年后的我正在看现在自己做的事，
        <br />
        会感到庆幸，还是感到懊悔？
      </h1>

      {/* 按钮 */}
      <div className="mt-14 w-full max-w-[280px] space-y-3.5">
        <button
          onClick={handleSwitch}
          className="w-full py-3.5 rounded-2xl bg-[#3E5C4A] text-white font-medium tracking-widest text-[16px] hover:bg-[#3E5C4A]/90 active:scale-[0.98] transition-all"
        >
          换一个小行动
        </button>
        <button
          onClick={handleContinue}
          className="w-full py-3.5 rounded-2xl border border-[#E4DCCF] text-[#7A756B] font-medium tracking-widest text-[16px] hover:border-[#A58E6F] hover:text-[#20201D] active:scale-[0.98] transition-all bg-[#FFFCF6]"
        >
          继续
        </button>
      </div>
    </div>
  );
}
