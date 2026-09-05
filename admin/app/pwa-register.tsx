"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        const path = window.location.pathname;
        const isAdminRoute = path.startsWith("/dashboard") || path.startsWith("/login");
        const swScript = isAdminRoute ? "/sw-admin.js" : "/sw.js";
        const swScope = isAdminRoute ? "/dashboard" : "/";

        navigator.serviceWorker
          .register(swScript, { scope: swScope })
          .then((reg) => {
            console.log(`PWA Service Worker (${swScript}) registered with scope:`, reg.scope);
          })
          .catch((err) => {
            // Fallback register without explicit scope if constrained
            navigator.serviceWorker.register(swScript).catch(() => {});
          });
      });
    }
  }, []);

  return null;
}
