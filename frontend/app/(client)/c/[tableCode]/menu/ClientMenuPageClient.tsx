"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import ClientShell, { panelClass } from "../ClientShell";

type Lang = "et" | "en";
type View = "menu" | "order" | "login" | "account";

type Category = { id: number; name: string; organizationId?: number };

type InvDto = {
  id: number;
  organizationId: number;
  productId: number;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  updatedAt: string;
};

const money = (n: number) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    n,
  );

// IMPORTANT: ClientShell inner content is max-w-md sm:max-w-xl.
// Match sticky to the same width to avoid “wider than content”.
const contentMax = "max-w-md sm:max-w-xl";

// Sticky panel style (keep simple to avoid “extra frame” feeling)
const panelSoft =
  "rounded-2xl bg-white/[0.06] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.65)] ring-1 ring-white/20";

/* ---------- tiny inline icons (no emoji, no deps) ---------- */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };
const I = {
  Login: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M10 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13 12H4m0 0 3-3M4 12l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Logout: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M14 7V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M11 12h9m0 0-3-3m3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  User: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  Cart: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M7 7h14l-1.2 7.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.7L5.8 4.5H3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 20a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4ZM17.5 20a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
        fill="currentColor"
      />
    </svg>
  ),
  Receipt: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M7 3h10a2 2 0 0 1 2 2v16l-2-1-2 1-2-1-2 1-2-1-2 1V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  Pay: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 10h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 16h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  Trash: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M9 3h6m-9 4h12m-1 0-.7 13a2 2 0 0 1-2 1.9H9.7a2 2 0 0 1-2-1.9L7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
  Plus: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Minus: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Gift: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4 12h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 12v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M12 6c0-2 1.5-3 3-3 1.8 0 3 1.5 3 3 0 2-2 3-4 3h-2V6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 6c0-2-1.5-3-3-3-1.8 0-3 1.5-3 3 0 2 2 3 4 3h2V6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export default function ClientMenuPageClient({
  tableCode,
}: {
  tableCode: string;
}) {
  const [lang, setLang] = useState<Lang>("et");
  const [view, setView] = useState<View>("menu");

  // orgId: default 2, saad URL-ist: /c/TEST-1/menu?orgId=2
  const [orgId, setOrgId] = useState<number>(2);

  const [cats, setCats] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Record<string, InvDto[]>>({});
  const [activeCat, setActiveCat] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // mini cart: productId -> qty
  const [cart, setCart] = useState<Record<string, number>>({});

  // DEMO auth gate
  const [isAuthed, setIsAuthed] = useState(false);

  const t = useMemo(() => {
    const dict = {
      et: {
        title: "Menüü",
        table: "Laud",
        back: "Tagasi lauale",

        menu: "Menüü",
        order: "Tellimus",
        login: "Logi sisse",
        logout: "Logi välja",
        account: "Konto",

        loginCta: "Tee konto / Logi sisse (soodustus)",

        perksTitle: "Soodustused & boonused",
        perksLockedTitle: "Ava soodustused ja boonused",
        perksLockedDesc:
          "Logi sisse, et näha personaalseid soodustusi, punktiseisu ja üritusi.",

        cats: "Kategooriad",
        all: "Kõik",
        products: "Tooted",
        add: "Lisa",

        cart: "Ostukorv",
        checkout: "Checkout / maksmine",
        clear: "Tühjenda",

        empty: "Selles kategoorias pole tooteid.",
        loading: "Laen…",
        items: "tk",
        emptyCart: "Ostukorv on tühi.",
        continueShopping: "Jätka menüüga",
        remove: "Eemalda",

        // progress / rewards
        discountTitle: "Soodustus",
        discountActive: "aktiivne",
        discountUnlockPrefix: "Lisa",
        discountUnlockSuffix: "ja saad",
        discountAppliesFrom: "Aktiveerub alates",
        loginToApply: "Logi sisse, et soodustus rakenduks",

        // account/dashboard
        dashTitle: "Sinu vaade",
        dashHint: "DEMO: hiljem asenda päris auth + API-ga.",
        points: "Punktid",
        level: "Tase",
        perks: "Boonused",
        vouchers: "Kupongid",
        recentOrders: "Viimased tellimused",
        payment: "Makseviisid",
        settings: "Seaded",
        openMenu: "Ava menüü",
        openOrder: "Ava tellimus",
      },
      en: {
        title: "Menu",
        table: "Table",
        back: "Back to table",

        menu: "Menu",
        order: "Order",
        login: "Login",
        logout: "Logout",
        account: "Account",

        loginCta: "Create account / Login (discount)",

        perksTitle: "Discounts & bonuses",
        perksLockedTitle: "Unlock discounts & bonuses",
        perksLockedDesc: "Login to see discounts, points and events.",

        cats: "Categories",
        all: "All",
        products: "Products",
        add: "Add",

        cart: "Cart",
        checkout: "Checkout / pay",
        clear: "Clear",

        empty: "No products in this category.",
        loading: "Loading…",
        items: "items",
        emptyCart: "Your cart is empty.",
        continueShopping: "Continue shopping",
        remove: "Remove",

        // progress / rewards
        discountTitle: "Discount",
        discountActive: "active",
        discountUnlockPrefix: "Add",
        discountUnlockSuffix: "to get",
        discountAppliesFrom: "Applies from",
        loginToApply: "Login to apply discount",

        // account/dashboard
        dashTitle: "Your dashboard",
        dashHint: "DEMO: replace with real auth + API later.",
        points: "Points",
        level: "Level",
        perks: "Perks",
        vouchers: "Vouchers",
        recentOrders: "Recent orders",
        payment: "Payment methods",
        settings: "Settings",
        openMenu: "Open menu",
        openOrder: "Open order",
      },
    } as const;

    return dict[lang];
  }, [lang]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const productById = useMemo(() => {
    const map = new Map<string, InvDto>();
    for (const arr of Object.values(groups)) {
      for (const p of arr) map.set(String(p.productId), p);
    }
    return map;
  }, [groups]);

  const cartTotal = useMemo(() => {
    let sum = 0;
    for (const [pid, qty] of Object.entries(cart)) {
      const p = productById.get(String(pid));
      if (p) sum += p.unitPrice * qty;
    }
    return sum;
  }, [cart, productById]);

  const cartLines = useMemo(() => {
    const lines = Object.entries(cart)
      .map(([pid, qty]) => {
        const p = productById.get(pid);
        if (!p) return null;
        return {
          id: pid,
          name: p.productName,
          qty,
          sum: p.unitPrice * qty,
          unitPrice: p.unitPrice,
        };
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      qty: number;
      sum: number;
      unitPrice: number;
    }[];

    lines.sort((a, b) => b.sum - a.sum);
    return lines;
  }, [cart, productById]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("orgId");
    if (q && !Number.isNaN(Number(q))) setOrgId(Number(q));
  }, []);

  // DEMO auth persistence
  useEffect(() => {
    const v = window.localStorage.getItem("demo_authed");
    if (v === "1") setIsAuthed(true);
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const cRes = await fetch(
          `/api/backend/categories?organizationId=${orgId}`,
          { cache: "no-store", credentials: "include" },
        );
        if (!cRes.ok) throw new Error(`Categories HTTP ${cRes.status}`);
        const cJson = await cRes.json();
        const categoryList: Category[] = Array.isArray(cJson)
          ? cJson
          : (cJson?.items ?? cJson?.content ?? []);

        if (!alive) return;
        setCats(categoryList);

        const fetches = categoryList.map(async (c) => {
          const res = await fetch(
            `/api/backend/inventory?categoryId=${c.id}&organizationId=${orgId}`,
            { cache: "no-store", credentials: "include" },
          );
          if (!res.ok)
            throw new Error(`Inventory HTTP ${res.status} (cat ${c.id})`);
          const j = await res.json();
          const arr: InvDto[] = Array.isArray(j)
            ? j
            : (j?.items ?? j?.content ?? []);
          return [c.name, arr] as const;
        });

        const results = await Promise.all(fetches);
        if (!alive) return;

        const grouped = Object.fromEntries(
          results.filter(([, arr]) => arr.length > 0),
        );
        setGroups(grouped);

        if (activeCat !== "all" && !grouped[activeCat]) setActiveCat("all");
      } catch (e) {
        if (!alive) return;
        setErr(e instanceof Error ? e.message : "Failed to load menu");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const visibleCategoryNames = useMemo(() => {
    const names = cats.map((c) => c.name);
    return names.filter((n) => (groups[n] ?? []).length > 0);
  }, [cats, groups]);

  const visibleItems = useMemo(() => {
    if (activeCat === "all")
      return visibleCategoryNames.flatMap((name) => groups[name] ?? []);
    return groups[activeCat] ?? [];
  }, [activeCat, groups, visibleCategoryNames]);

  const addToCart = (p: InvDto) => {
    const id = String(p.productId);
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const changeQty = (pid: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      const cur = next[pid] || 0;
      const v = cur + delta;
      if (v <= 0) delete next[pid];
      else next[pid] = v;
      return next;
    });
  };

  const removeLine = (pid: string) => {
    setCart((c) => {
      const next = { ...c };
      delete next[pid];
      return next;
    });
  };

  const clearCart = () => setCart({});

  const goCheckout = () => alert("Checkout (demo)");
  const openOrder = () => setView("order");
  const openMenu = () => setView("menu");
  const goAccount = () => setView("account");

  const goLogin = () => {
    setView("login");
    // DEMO login
    setIsAuthed(true);
    window.localStorage.setItem("demo_authed", "1");
  };

  const demoLogout = () => {
    setIsAuthed(false);
    window.localStorage.removeItem("demo_authed");
    setView("menu");
  };

  // --- PROGRESS (discount meter) ---
  const discountThreshold = 20; // EUR
  const discountPct = 5; // %
  const discountProgress = Math.min(cartTotal / discountThreshold, 1);
  const missing = Math.max(discountThreshold - cartTotal, 0);

  // DEMO dashboard numbers (placeholder)
  const demoPoints = 120;
  const demoLevel = "Silver";
  const demoVouchers = 2;

  const subtleCard = "rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]";

  // Show sticky ONLY on menu+order (fix: “footer looks like it’s inside account card”)
  const needsSticky = true;

  // Reserve space only when sticky exists
  const stickyReserve = needsSticky
    ? "pb-[calc(200px+env(safe-area-inset-bottom))] sm:pb-[calc(140px+env(safe-area-inset-bottom))]"
    : "pb-[calc(24px+env(safe-area-inset-bottom))]";

  const IconBtnBase =
    "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white/90 transition";
  const PillBase =
    "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white/90 transition";
  const PrimaryPill =
    "inline-flex items-center gap-2 rounded-full bg-blue-500/90 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition disabled:opacity-40 disabled:hover:bg-blue-500/90";

  return (
    <ClientShell title={t.title} lang={lang} onLangChange={setLang}>
      {/* top info */}
      <section className={`${panelClass} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-white/60">
              {t.table}:{" "}
              <span className="font-semibold text-white/90">{tableCode}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/45">
              <span>orgId: {orgId}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <I.Cart className="h-4 w-4" />
                {t.cart}: {cartCount}
              </span>
              <span>•</span>
              <span>{money(cartTotal)}</span>
            </div>

            <a
              href={`/c/${encodeURIComponent(tableCode)}`}
              className="mt-3 inline-flex text-sm font-semibold text-blue-300/90 hover:text-blue-200">
              ← {t.back}
            </a>
          </div>

          {/* auth button: login OR account */}
          <div className="shrink-0">
            {isAuthed ? (
              <button onClick={goAccount} className={PillBase}>
                <I.User className="h-4 w-4" />
                {t.account}
              </button>
            ) : (
              <button onClick={goLogin} className={PillBase}>
                <I.Login className="h-4 w-4" />
                {t.login}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* perks gate (only when NOT authed) */}
      {!isAuthed && (
        <section className={`${panelClass} mt-4 p-4`}>
          <div className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
            {t.perksTitle}
          </div>

          <div className={`mt-3 ${subtleCard} p-4`}>
            <div className="text-sm font-semibold text-white/85">
              {t.perksLockedTitle}
            </div>
            <div className="mt-1 text-xs text-white/55">
              {t.perksLockedDesc}
            </div>

            <div className="mt-3">
              <button onClick={goLogin} className={PrimaryPill}>
                <I.Login className="h-4 w-4" />
                {t.loginCta}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* states */}
      {loading && (
        <div className={`${panelClass} mt-4 p-4 text-sm text-white/70`}>
          {t.loading}
        </div>
      )}

      {err && (
        <div className={`${panelClass} mt-4 p-4`}>
          <div className="text-sm font-semibold text-red-300">Error</div>
          <div className="mt-2 text-xs text-white/60 break-all">{err}</div>

          <div className="mt-3 text-xs text-white/50">
            Kontrolli, et need URL-id töötavad:
            <br />
            <code className="text-white/70">
              /api/backend/categories?organizationId={orgId}
            </code>
            <br />
            <code className="text-white/70">
              /api/backend/inventory?categoryId=...&organizationId={orgId}
            </code>
          </div>
        </div>
      )}

      {/* ACCOUNT / DASHBOARD (authed) */}
      {!loading && !err && view === "account" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                {t.account}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/90">
                {t.dashTitle}
              </div>
              <div className="mt-1 text-xs text-white/45">{t.dashHint}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={openMenu} className={PillBase}>
                {t.openMenu}
              </button>
              <button onClick={demoLogout} className={PillBase}>
                <I.Logout className="h-4 w-4" />
                {t.logout}
              </button>
            </div>
          </div>

          {/* KPI cards */}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className={`${subtleCard} p-4`}>
              <div className="text-xs text-white/55">{t.points}</div>
              <div className="mt-2 text-2xl font-semibold text-white/90">
                {demoPoints}
              </div>
              <div className="mt-1 text-xs text-white/45">
                {t.level}: {demoLevel}
              </div>
            </div>

            <div className={`${subtleCard} p-4`}>
              <div className="flex items-center gap-2 text-xs text-white/55">
                <I.Gift className="h-4 w-4" />
                {t.perks}
              </div>
              <div className="mt-2 text-sm font-semibold text-white/90">
                -{discountPct}% {t.discountActive}
              </div>
              <div className="mt-1 text-xs text-white/45">
                {t.discountAppliesFrom} {money(discountThreshold)}
              </div>
            </div>

            <div className={`${subtleCard} p-4`}>
              <div className="text-xs text-white/55">{t.vouchers}</div>
              <div className="mt-2 text-2xl font-semibold text-white/90">
                {demoVouchers}
              </div>
              <div className="mt-1 text-xs text-white/45">DEMO</div>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-4 grid gap-3">
            <div className={`${subtleCard} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white/90">
                  {t.recentOrders}
                </div>
                <button onClick={openOrder} className={PillBase}>
                  <I.Receipt className="h-4 w-4" />
                  {t.openOrder}
                </button>
              </div>
              <div className="mt-2 text-xs text-white/55">
                (TODO) Näita päris tellimuste ajalugu / “repeat order”.
              </div>
            </div>

            <div className={`${subtleCard} p-4`}>
              <div className="text-sm font-semibold text-white/90">
                {t.payment}
              </div>
              <div className="mt-2 text-xs text-white/55">
                (TODO) Smart-ID / pangalink / salvestatud makseviisid.
              </div>
            </div>

            <div className={`${subtleCard} p-4`}>
              <div className="text-sm font-semibold text-white/90">
                {t.settings}
              </div>
              <div className="mt-2 text-xs text-white/55">
                (TODO) Keel, teavitused, “age verification”, profiil.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ORDER VIEW (has progress meter) */}
      {!loading && !err && view === "order" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                {t.order}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/90">
                {cartCount} {t.items} • {money(cartTotal)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {cartCount > 0 && (
                <button onClick={clearCart} className={PillBase}>
                  <I.Trash className="h-4 w-4" />
                  {t.clear}
                </button>
              )}
              <button onClick={openMenu} className={PillBase}>
                {t.continueShopping}
              </button>
            </div>
          </div>

          {/* Discount progress */}
          <div className={`mt-4 ${subtleCard} p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-white/55">{t.discountTitle}</div>

                {cartTotal >= discountThreshold ? (
                  <div className="mt-1 text-sm font-semibold text-white/90">
                    -{discountPct}% {t.discountActive}
                  </div>
                ) : (
                  <div className="mt-1 text-sm font-semibold text-white/90">
                    {t.discountUnlockPrefix} {money(missing)}{" "}
                    {t.discountUnlockSuffix} -{discountPct}%
                  </div>
                )}

                <div className="mt-1 text-xs text-white/45">
                  {t.discountAppliesFrom} {money(discountThreshold)}
                </div>
              </div>

              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                {money(cartTotal)} / {money(discountThreshold)}
              </span>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500/80"
                style={{ width: `${Math.round(discountProgress * 100)}%` }}
              />
            </div>

            {!isAuthed && (
              <button onClick={goLogin} className={`mt-3 ${PillBase}`}>
                <I.Login className="h-4 w-4" />
                {t.loginToApply}
              </button>
            )}
          </div>

          {cartLines.length === 0 ? (
            <div className="mt-4 text-sm text-white/55">{t.emptyCart}</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {cartLines.map((x) => (
                <div key={x.id} className={`${subtleCard} p-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-white/90 truncate">
                        {x.name}
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        {x.qty} × {money(x.unitPrice)}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-white/85">
                      {money(x.sum)}
                    </div>
                  </div>

                  {/* compact app-like controls */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => changeQty(x.id, -1)}
                        className={`${IconBtnBase} h-10 w-10`}
                        aria-label="Decrease">
                        <I.Minus className="h-5 w-5" />
                      </button>

                      <div className="min-w-[38px] text-center text-sm font-semibold text-white/85">
                        {x.qty}
                      </div>

                      <button
                        onClick={() => changeQty(x.id, +1)}
                        className={`${IconBtnBase} h-10 w-10`}
                        aria-label="Increase">
                        <I.Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeLine(x.id)}
                      className={`${IconBtnBase} h-10 w-10`}
                      aria-label={t.remove}
                      title={t.remove}>
                      <I.Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MENU VIEW */}
      {!loading && !err && view === "menu" && (
        <div className={`mt-4 grid gap-4 ${stickyReserve}`}>
          {/* categories */}
          <section className={`${panelClass} p-4`}>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
                {t.cats}
              </div>
              <div className="text-xs text-white/45">
                {visibleItems.length} {t.items}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCat("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeCat === "all"
                    ? "bg-blue-500/90 text-white"
                    : "border border-white/10 bg-white/5 text-white/60 hover:text-white/85"
                }`}>
                {t.all}
              </button>

              {visibleCategoryNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveCat(name)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeCat === name
                      ? "bg-blue-500/90 text-white"
                      : "border border-white/10 bg-white/5 text-white/60 hover:text-white/85"
                  }`}>
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* products */}
          <section className={`${panelClass} p-4`}>
            <div className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
              {t.products}
            </div>

            {visibleItems.length === 0 ? (
              <div className="mt-3 text-sm text-white/55">{t.empty}</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {visibleItems
                  .slice()
                  .sort((a, b) => a.productName.localeCompare(b.productName))
                  .map((p) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.05]">
                      {/* LEFT: name + desc */}
                      <div className="min-w-0">
                        <div className="font-semibold text-white/90">
                          {p.productName}
                        </div>
                        {p.description ? (
                          <div className="mt-1 text-xs text-white/45">
                            {p.description}
                          </div>
                        ) : null}
                      </div>

                      {/* RIGHT: price + add (centered vertically) */}
                      <div className="shrink-0 flex items-center gap-3 self-center">
                        <div className="text-sm font-semibold text-white/90 tabular-nums">
                          {money(p.unitPrice)}
                        </div>

                        <button
                          onClick={() => addToCart(p)}
                          className={PrimaryPill}>
                          <I.Plus className="h-4 w-4" />
                          {t.add}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* LOGIN VIEW */}
      {!loading && !err && view === "login" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div className="text-[11px] font-semibold tracking-[0.18em] text-white/55 uppercase">
            {t.login}
          </div>

          <div className="mt-3 text-sm text-white/70">
            (TODO) Siia tuleb päris login/registration flow.
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={openMenu} className={PillBase}>
              {t.menu}
            </button>

            <button
              onClick={() => {
                setIsAuthed(true);
                window.localStorage.setItem("demo_authed", "1");
                setView("account"); // pärast demo-login: dashboardi
              }}
              className={PrimaryPill}>
              <I.Login className="h-4 w-4" />
              {t.loginCta}
            </button>
          </div>
        </section>
      )}

      {/* Sticky bottom checkout bar (ONLY on menu+order) */}
      {needsSticky && (
        <div className="fixed inset-x-0 z-50 bottom-[calc(12px+env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full px-4">
            <div className={`mx-auto w-full ${contentMax}`}>
              <div className="relative">
                {/* soft glow only */}
                <div className="pointer-events-none absolute -inset-3 rounded-[28px] bg-blue-500/12 blur-2xl" />

                <div className={`${panelSoft} relative px-3 py-3`}>
                  {/* ROW 1: badge left, total right (ALWAYS one line) */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <I.Cart className="h-4 w-4 text-white/60" />

                      {cartCount > 0 ? (
                        <span className="rounded-full bg-blue-500/25 px-2 py-[2px] text-[11px] font-semibold text-blue-100">
                          {cartCount} {t.items}
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-[2px] text-[11px] font-semibold text-white/45">
                          0
                        </span>
                      )}

                      <span className="text-xs text-white/55 truncate">
                        {t.cart}
                      </span>
                    </div>

                    <div className="shrink-0 text-sm font-semibold text-white/90">
                      {money(cartTotal)}
                    </div>
                  </div>

                  {/* ROW 2: actions */}
                  <div className="mt-3 grid grid-cols-[44px_1fr_1fr] gap-2">
                    <button
                      onClick={clearCart}
                      disabled={cartCount === 0}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white/90 transition disabled:opacity-35"
                      aria-label={t.clear}
                      title={t.clear}>
                      <I.Trash className="h-5 w-5" />
                    </button>

                    <button
                      onClick={openOrder}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/70 hover:text-white/90 transition">
                      <I.Receipt className="h-4 w-4" />
                      {t.order}
                    </button>

                    <button
                      onClick={goCheckout}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-500/90 px-3 text-xs font-semibold text-white hover:bg-blue-500 transition disabled:opacity-40 disabled:hover:bg-blue-500/90"
                      disabled={cartCount === 0}>
                      <I.Pay className="h-4 w-4" />
                      {t.checkout}
                    </button>
                  </div>
                </div>

                <div className="pointer-events-none mx-auto mt-2 h-1 w-10 rounded-full bg-white/10 sm:hidden" />
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientShell>
  );
}
