"use client";

import { useEffect, useMemo, useState } from "react";
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

type Lang = "et" | "en";

type Props = {
  tableCode: string;
};

export default function ClientTablePageClient({ tableCode }: Props) {
  const [lang, setLang] = useState<Lang>("et");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
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
        copied: "Link copied ✅",
        shareFail: "Share failed (copy the link).",
        qrLoading: "QR loading…",
      },
    } as const;

    return dict[lang];
  }, [lang]);

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
      actions={<ThemeToggle />}
      logoHref={`/c/${encodeURIComponent(tableCode)}/menu`}>
      <a
        href={`/c/${encodeURIComponent(tableCode)}/menu`}
        className="mt-8 block">
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

        <div className={`${panelClass} p-4`}>
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-black/55 dark:text-white/55">
            {t.shareTitle}
          </div>
          <div className="mt-2 text-sm text-black/65 dark:text-white/65">
            {t.shareHint}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <button
              type="button"
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

          <div className="mt-8 mb-6 flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR"
                className="h-40 w-40 rounded-xl bg-white"
              />
            ) : (
              <div className="text-xs text-black/50 dark:text-white/50">
                {t.qrLoading}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-black/35 dark:text-white/35">
        Tudengibaar · QR tellimine
      </div>
    </ClientShell>
  );
}
