"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("归位 SW registered");
        })
        .catch((err) => {
          console.log("归位 SW registration failed:", err);
        });
    }
  }, []);

  return null;
}
