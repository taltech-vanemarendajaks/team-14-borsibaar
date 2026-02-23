"use client";

import Image from "next/image";
import React, { ReactNode, useEffect, useState } from "react";

type Lang = "et" | "en";

const IconSpark = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M12 2l1.8 4.6L18 8.4l-4.2 1.8L12 15l-1.8-4.8L6 8.4l4.2-1.8L12 2z"
      stroke="currentColor"
      strokeWidth="1.4"
      fill="currentColor"
    />
  </svg>
);

// Light/Dark-aware panel styling
export const panelClass =
  "rounded-2xl border border-black/10 bg-white/90 text-[#070A12] backdrop-blur-md shadow-[0_18px_70px_rgba(0,0,0,0.08)] dark:border-white/[0.06] dark:bg-[#070A12]/95 dark:text-white dark:shadow-[0_18px_70px_rgba(0,0,0,0.6)]";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  const Sun = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2.5V5M12 19v2.5M4.5 12H2M22 12h-2.5M6.1 6.1 4.3 4.3m15.4 15.4-1.8-1.8M17.9 6.1l1.8-1.8M6.1 17.9l-1.8 1.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );

  const Moon = (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M21 12.8a8.5 8.5 0 1 1-9.8-9.6
         6.8 6.8 0 0 0 9.8 9.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  useEffect(() => {
    // Use saved theme if available, otherwise fall back to system
    const saved = window.localStorage.getItem("theme");
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const t =
      saved === "light" || saved === "dark"
        ? (saved as "light" | "dark")
        : systemPrefersDark
          ? "dark"
          : "light";

    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme((cur) => {
      const next = cur === "dark" ? "light" : "dark";
      window.localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  // Prevent hydration mismatch / flicker
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="
        inline-flex items-center justify-center
        h-9 w-9 rounded-full
        border border-black/10 bg-black/5
        text-black/70 hover:text-black/90 transition
        dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white/90
      "
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}>
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

type Props = {
  title: string;
  brand?: string;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  toast?: string | null;
  actions?: ReactNode; // render next to language toggle
  children: ReactNode;
};

export default function ClientShell({
  title,
  brand = "TUDENGIBAAR",
  lang,
  onLangChange,
  toast,
  actions,
  children,
}: Props) {
  return (
    // ✅ Set readable defaults for BOTH themes
    <main className="relative min-h-screen overflow-hidden bg-white text-[#070A12] dark:bg-[#070A12] dark:text-white">
      {/* DARK background layers only (hide in light theme) */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden bg-[#070A12] dark:block" />

      {/* background: sweep gradient (dark only) */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block">
        <div
          className="
            absolute inset-y-0 left-[-220px] right-0
            blur-[12px]
            bg-[linear-gradient(
              90deg,
              rgba(7,10,18,0) 0%,
              rgba(7,10,18,0.18) 20%,
              rgba(7,10,18,0.55) 45%,
              rgba(7,10,18,0.90) 75%,
              rgba(7,10,18,1) 100%
            )]
          "
        />
      </div>

      {/* background: radial spotlight (dark only) */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(255,255,255,0.06)_0%,rgba(7,10,18,0)_72%)]" />
      </div>

      {/* ✅ Optional: subtle light background texture (helps “empty white” feel) */}
      <div className="pointer-events-none absolute inset-0 z-0 dark:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(0,0,0,0.05)_0%,rgba(255,255,255,0)_72%)]" />
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-black/85 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/85">
            {toast}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-start justify-center px-4 py-4">
        <div className="w-full max-w-md sm:max-w-xl">
          {/* header */}
          <header className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Top row: logo */}
              <div className="flex items-center gap-3">
                <Image
                  src="/tudengibaarlogo.png"
                  alt="Tudengibaar"
                  width={220}
                  height={72}
                  priority
                  className="
                      h-9 sm:h-10 w-auto -mt-[2px] opacity-95
                      drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]
                      dark:drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]
                      invert dark:invert-0
                    "
                />
              </div>

              {/* ✅ Ensure title is dark in light mode, light in dark mode */}
              <h1 className="mt-3 ml-4 text-2xl font-semibold leading-tight text-[#070A12]/90 dark:text-white/92">
                {title}
              </h1>
            </div>

            {/* Right side: language toggle + actions */}
            <div className="shrink-0 flex items-center gap-2">
              <div className="inline-flex rounded-full border border-black/10 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5">
                <button
                  onClick={() => onLangChange("et")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    lang === "et"
                      ? "bg-blue-500/90 text-white"
                      : "text-black/60 hover:text-black/80 dark:text-white/60 dark:hover:text-white/80"
                  }`}>
                  ET
                </button>
                <button
                  onClick={() => onLangChange("en")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    lang === "en"
                      ? "bg-blue-500/90 text-white"
                      : "text-black/60 hover:text-black/80 dark:text-white/60 dark:hover:text-white/80"
                  }`}>
                  EN
                </button>
              </div>

              {actions}
            </div>
          </header>

          {/* ✅ Make sure children inherit correct text color in light mode */}
          <div className="text-[#070A12] dark:text-white">{children}</div>
        </div>
      </div>
    </main>
  );
}
