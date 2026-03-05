"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

import ClientShell, { panelClass, ThemeToggle } from "./ClientShell";

const IconArrow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M5 12h12m0 0-4-4m4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCopy = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" />
    <rect x="4" y="4" width="11" height="11" rx="2" stroke="currentColor" />
  </svg>
);

type Lang = "et" | "en";

type Props = {
  tableCode: string;
};

export default function ClientTablePageClient({ tableCode }: Props) {
  const [lang, setLang] = useState<Lang>("et");
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // avoids hydration mismatch (server doesn't know window.location)
  const [tableUrl, setTableUrl] = useState("");

  useEffect(() => {
    setTableUrl(`${window.location.origin}/c/${encodeURIComponent(tableCode)}`);
  }, [tableCode]);

  const t = useMemo(() => {
    const dict = {
      et: {
        title: "Tere tulemast",
        youOrderTo: "Sa tellid lauale:",
        cta: "Ava menüü",
        hint: "Tellimine toimub otse telefonist",
        important: "OLULINE INFO",
        rule1: "Maksad letis / maksad hiljem (vastavalt baarile)",
        rule2: "Allergiad? Küsi teenindajalt.",
        shareTitle: "JAGA LAUDA",
        shareHint: "Kutsu sõber sama laua tellimusse.",
        copy: "Kopeeri link",
        share: "Jaga",
        showQr: "Näita QR-i (jagamiseks)",
        copied: "Link kopeeritud ✅",
        shareFail: "Jagamine ei õnnestunud (kopeeri link).",
        qrLoading: "QR laadib…",
      },
      en: {
        title: "Welcome",
        youOrderTo: "You are ordering to table:",
        cta: "Open menu",
        hint: "Order directly from your phone",
        important: "IMPORTANT",
        rule1: "Pay at the bar / pay later (depends on venue)",
        rule2: "Allergies? Ask the staff.",
        shareTitle: "SHARE TABLE",
        shareHint: "Invite a friend to the same table order.",
        copy: "Copy link",
        share: "Share",
        showQr: "Show QR (for sharing)",
        copied: "Link copied ✅",
        shareFail: "Share failed (copy the link).",
        qrLoading: "QR loading…",
      },
    } as const;

    return dict[lang];
  }, [lang]);

  // QR generation
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!tableUrl) return;
      try {
        const url = await QRCode.toDataURL(tableUrl, {
          margin: 2,
          scale: 8,
          errorCorrectionLevel: "M",
        });
        if (!alive) return;
        setQrDataUrl(url);
      } catch {
        if (!alive) return;
        setQrDataUrl(null);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [tableUrl]);

  // toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const tmr = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(tmr);
  }, [toast]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(tableUrl);
      setToast(t.copied);
    } catch {
      setToast(t.shareFail);
    }
  };

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Table link",
          text: `Table: ${tableCode}`,
          url: tableUrl,
        });
      } else {
        await onCopy();
      }
    } catch {
      setToast(t.shareFail);
    }
  };

  return (
    <ClientShell
      title={t.title}
      lang={lang}
      onLangChange={setLang}
      toast={toast}
      actions={<ThemeToggle />}>
      {/* table card */}
      <section className={`${panelClass} p-4`}>
        <div className="text-sm text-black/60 dark:text-white/60">
          {t.youOrderTo}
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <div className="text-lg font-semibold tracking-wide text-black/90 dark:text-white/90">
            {tableCode}
          </div>

          {tableUrl ? (
            <div className="text-xs text-black/45 dark:text-white/40 break-all">
              {tableUrl}
            </div>
          ) : (
            <div className="text-xs text-black/25 dark:text-white/25">…</div>
          )}
        </div>
      </section>

      {/* CTA */}
      <a
        href={`/c/${encodeURIComponent(tableCode)}/menu`}
        className="mt-5 block">
        <span
          className="
            inline-flex w-full items-center justify-center
            rounded-[999px]
            bg-blue-500/90
            px-8 py-6
            text-lg font-semibold text-white
            shadow-[0_18px_60px_rgba(0,0,0,0.25)]
            transition
            hover:bg-blue-500
            active:scale-[0.985]
            focus:outline-none focus:ring-2 focus:ring-amber-400/35
          ">
          {t.cta}
          <IconArrow className="ml-3 h-5 w-5 text-white/90" />
        </span>
      </a>

      <div className="mt-3 text-center text-xs text-black/45 dark:text-white/45">
        {t.hint}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* important */}
        <div className={`${panelClass} p-4`}>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/55 dark:text-white/55">
            {t.important}
          </div>
          <ul className="mt-3 space-y-2 text-sm text-black/70 dark:text-white/70">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500/90" />
              <span>{t.rule1}</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500/90" />
              <span>{t.rule2}</span>
            </li>
          </ul>
        </div>

        {/* share */}
        <div className={`${panelClass} p-4`}>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/55 dark:text-white/55">
            {t.shareTitle}
          </div>
          <div className="mt-2 text-sm text-black/65 dark:text-white/65">
            {t.shareHint}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={onCopy}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl border border-black/10 bg-black/[0.03]
                px-4 py-2.5
                text-sm font-semibold text-black/85
                transition hover:bg-black/[0.06]
                active:scale-[0.99]
                dark:border-white/[0.10] dark:bg-white/[0.03] dark:text-white/85 dark:hover:bg-white/[0.06]
              ">
              <IconCopy className="h-4 w-4 text-black/60 dark:text-white/70" />
              {t.copy}
            </button>

            <button
              onClick={onShare}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl bg-blue-500/85
                px-4 py-2.5
                text-sm font-semibold text-white
                shadow-[0_14px_40px_rgba(0,0,0,0.20)]
                transition hover:bg-blue-500
                active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-amber-400/35
              ">
              {t.share}
              <IconArrow className="h-4 w-4 text-white/90" />
            </button>
          </div>

          <button
            onClick={() => setShowQr((v) => !v)}
            className="mt-3 w-full rounded-full px-3 py-2 text-xs font-semibold text-black/60 hover:text-black/80 dark:text-white/60 dark:hover:text-white/80">
            {t.showQr}
          </button>

          {showQr && (
            <div className="mt-3 flex items-center justify-center p-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR"
                  className="h-40 w-40 rounded-xl bg-white p-2"
                />
              ) : (
                <div className="text-xs text-black/50 dark:text-white/50">
                  {t.qrLoading}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-black/35 dark:text-white/35">
        Tudengibaar · QR tellimine
      </div>
    </ClientShell>
  );
}
