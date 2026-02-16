"use client";

import Image from "next/image";
import { ReactNode } from "react";

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

export const panelClass =
  "rounded-2xl border border-white/[0.06] bg-[#070A12]/95 backdrop-blur-md shadow-[0_18px_70px_rgba(0,0,0,0.6)]";

type Props = {
  title: string;
  brand?: string;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  toast?: string | null;
  children: ReactNode;
};

export default function ClientShell({
  title,
  brand = "TUDENGIBAAR",
  lang,
  onLangChange,
  toast,
  children,
}: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070A12] text-white">
      {/* background base */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#070A12]" />

      {/* background: sweep gradient */}
      <div className="pointer-events-none absolute inset-0 z-0">
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

      {/* background: radial spotlight */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(255,255,255,0.06)_0%,rgba(7,10,18,0)_72%)]" />
      </div>

      {/* toast */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur">
            {toast}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-start justify-center px-4 py-4">
        <div className="w-full max-w-md sm:max-w-xl">
          {/* header */}
          <header className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Top row: logo + (optional) small spacer */}
              <div className="flex items-center gap-3">
                <Image
                  src="/tudengibaarlogo.png"
                  alt="Tudengibaar"
                  width={220}
                  height={72}
                  priority
                  className="
          h-9 sm:h-10 w-auto
          -mt-[2px]
          drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]
          brightness-0 invert
          opacity-95
        "
                />
              </div>

              {/* Title aligns nicely under the logo */}
              <h1 className="mt-3 ml-4 text-2xl font-semibold leading-tight text-white/92">
                {title}
              </h1>
            </div>

            {/* Language toggle aligned to top */}
            <div className="shrink-0">
              <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => onLangChange("et")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    lang === "et"
                      ? "bg-blue-500/90 text-white"
                      : "text-white/60 hover:text-white/80"
                  }`}>
                  ET
                </button>
                <button
                  onClick={() => onLangChange("en")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    lang === "en"
                      ? "bg-blue-500/90 text-white"
                      : "text-white/60 hover:text-white/80"
                  }`}>
                  EN
                </button>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
