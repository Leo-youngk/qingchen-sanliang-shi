"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CircleDot, PauseCircle, Moon, ScrollText } from "lucide-react";

const tabs = [
  { label: "今日", path: "/", icon: CircleDot },
  { label: "暂停", path: "/pause", icon: PauseCircle },
  { label: "预演", path: "/preview", icon: Moon },
  { label: "记录", path: "/records", icon: ScrollText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E4DCCF] bg-[#F6F1E8]/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/" ? pathname === "/" : pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors duration-150 ${
                isActive
                  ? "text-[#3E5C4A]"
                  : "text-[#B8B0A4] hover:text-[#7A756B]"
              }`}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
