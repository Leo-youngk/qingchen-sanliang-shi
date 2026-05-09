"use client";

import { BottomNav } from "./BottomNav";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <ServiceWorkerRegistration />
      <main className="flex-1 pb-20 max-w-[430px] mx-auto w-full px-6 pt-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
