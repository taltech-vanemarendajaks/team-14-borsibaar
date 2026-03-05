"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import ClientShell, { panelClass, ThemeToggle } from "../ClientShell";

type Lang = "et" | "en";
type View =
  | "menu"
  | "order"
  | "login"
  | "account"
  | "smartid"
  | "checkout"
  | "confirm";

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

/* ---------------- THEME TOKENS (fix light mode) ---------------- */
const T = {
  text: "text-[#070A12]/90 dark:text-white/90",
  textStrong: "text-[#070A12] dark:text-white",
  muted: "text-black/60 dark:text-white/60",
  faint: "text-black/45 dark:text-white/45",
  faint2: "text-black/55 dark:text-white/55",
  link: "text-blue-600 hover:text-blue-500 dark:text-blue-300/90 dark:hover:text-blue-200",
  softBg: "bg-black/5 dark:bg-white/5",
  softBorder: "border border-black/10 dark:border-white/10",
  ringSoft: "ring-1 ring-black/[0.06] dark:ring-white/[0.06]",
  card: "rounded-2xl bg-black/[0.03] ring-1 ring-black/[0.06] dark:bg-white/[0.03] dark:ring-white/[0.06]",
};

// Sticky panel style (theme aware)
const panelSoft =
  "rounded-2xl bg-white/85 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/10 " +
  "dark:bg-white/[0.06] dark:shadow-[0_20px_60px_rgba(0,0,0,0.65)] dark:ring-white/20";

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
  Shield: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M12 3 20 7v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V7l8-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5l1.6 1.6 3.6-3.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

/* ---------------- spinner (tailwind) ---------------- */
function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`animate-spin ${className}`}
      aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

type SmartIdStep = 0 | 1 | 2; // 0=input, 1=waiting, 2=confirmed
type SmartIdReason = "signup" | "checkout"; // signup=konto loomine / login; checkout=vanusekinnitus enne maksmist

function isAlcoholCategory(categoryName: string) {
  const s = categoryName.toLowerCase().trim();

  if (s.includes("alkovaba")) return false;

  // alkoholi kategooriad
  const alcoholCats = [
    "longer", // Longerod
    "shot", // Shotid
    "alko",
    "alkohol",
    "õlu",
    "siider",
    "kõik",
    "kokteil", // kui sul kokteilid on alkohoolsed
  ];

  return alcoholCats.some((k) => s.includes(k));
}
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

  // ✅ eralda login ja vanusekinnitus
  const [isLoggedIn, setIsLoggedIn] = useState(false); // konto olemas / sessioon
  const [isAgeVerified, setIsAgeVerified] = useState(false); // Smart-ID vanusekinnitus (konto või külaline)

  // checkout progression
  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2>(0);

  // Smart-ID flow
  const [smartIdStep, setSmartIdStep] = useState<SmartIdStep>(0);
  const [personalCode, setPersonalCode] = useState("");
  const [smartErr, setSmartErr] = useState<string | null>(null);
  const [smartReason, setSmartReason] = useState<SmartIdReason>("checkout");

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

        // Smart-ID (vanusekinnitus)
        smartTitle: "Smart-ID vanusekinnitus",
        smartDesc: "(DEMO) Sisesta isikukood ja kinnita Smart-ID äpis.",
        smartCodeLabel: "Isikukood",
        smartCodePh: "nt 39xxxxxxxxx",
        smartStart: "Alusta Smart-ID",
        smartCancel: "Katkesta",
        smartWaiting: "Ootan kinnitust Smart-ID äpis…",
        smartHint: "Kontrolli telefoni ja kinnita. Kohe liigun edasi.",
        smartDone: "Kinnitatud ✅",
        smartContinue: "Jätka",

        // Checkout / confirm
        checkoutTitle: "Maksmine",
        checkoutPrep: "Valmistan makse ette…",
        checkoutOpen: "Avan Montonio…",
        checkoutWait: "Ootan makse kinnitust…",
        checkoutDemoHint:
          "(DEMO) Siin läheksid päriselt maksele. Kohe toon tagasi.",
        confirmTitle: "Kinnitamine",
        confirmDesc: "(DEMO) Makse kinnitatud. Tellimus on kinnitatud.",
        backToMenu: "Tagasi menüüsse",

        // alcohol gate text
        alcoholGateTitle: "Vanusekinnitus vajalik",
        alcoholGateDesc:
          "Ostukorvis on alkohol. Enne maksmist on vaja Smart-ID vanusekinnitust. Alkohoolita tooteid saab osta ka ilma kontota.",
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

        // Smart-ID (age verify)
        smartTitle: "Smart-ID age verification",
        smartDesc: "(DEMO) Enter personal code and confirm in Smart-ID app.",
        smartCodeLabel: "Personal code",
        smartCodePh: "e.g. 39xxxxxxxxx",
        smartStart: "Start Smart-ID",
        smartCancel: "Cancel",
        smartWaiting: "Waiting for confirmation in Smart-ID…",
        smartHint: "Check your phone and confirm. Continuing next.",
        smartDone: "Verified ✅",
        smartContinue: "Continue",

        // Checkout / confirm
        checkoutTitle: "Payment",
        checkoutPrep: "Preparing payment…",
        checkoutOpen: "Opening Montonio…",
        checkoutWait: "Waiting for confirmation…",
        checkoutDemoHint:
          "(DEMO) This would redirect to payment. Coming back soon.",
        confirmTitle: "Confirmation",
        confirmDesc: "(DEMO) Payment confirmed. Order is placed.",
        backToMenu: "Back to menu",

        // alcohol gate text
        alcoholGateTitle: "Age verification required",
        alcoholGateDesc:
          "Your cart contains alcohol. Smart-ID age verification is required before payment. Non-alcohol items can be purchased without an account.",
      },
    } as const;

    return dict[lang];
  }, [lang]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  // Build product lookup + category map (to detect alcohol in cart)
  const productMetaById = useMemo(() => {
    const map = new Map<string, { p: InvDto; categoryName: string }>();
    for (const [catName, arr] of Object.entries(groups)) {
      for (const p of arr)
        map.set(String(p.productId), { p, categoryName: catName });
    }
    return map;
  }, [groups]);

  const productById = useMemo(() => {
    const map = new Map<string, InvDto>();
    for (const v of productMetaById.values())
      map.set(String(v.p.productId), v.p);
    return map;
  }, [productMetaById]);

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
        const m = productMetaById.get(pid);
        if (!m) return null;
        return {
          id: pid,
          name: m.p.productName,
          qty,
          sum: m.p.unitPrice * qty,
          unitPrice: m.p.unitPrice,
          categoryName: m.categoryName,
        };
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      qty: number;
      sum: number;
      unitPrice: number;
      categoryName: string;
    }[];

    lines.sort((a, b) => b.sum - a.sum);
    return lines;
  }, [cart, productMetaById]);

  const cartHasAlcohol = useMemo(() => {
    for (const [pid, qty] of Object.entries(cart)) {
      if (qty <= 0) continue;
      const m = productMetaById.get(pid);
      if (!m) continue;
      if (isAlcoholCategory(m.categoryName)) return true;
    }
    return false;
  }, [cart, productMetaById]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("orgId");
    if (q && !Number.isNaN(Number(q))) setOrgId(Number(q));
  }, []);

  // Reset Smart-ID UI when opening smartid view
  useEffect(() => {
    if (view !== "smartid") return;
    setSmartIdStep(0);
    setPersonalCode("");
    setSmartErr(null);
  }, [view]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const cRes = await fetch(
          `/api/backend/categories?organizationId=${orgId}`,
          {
            cache: "no-store",
            credentials: "include",
          },
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
            {
              cache: "no-store",
              credentials: "include",
            },
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

  const AddPill =
    "inline-flex items-center gap-2 rounded-full " +
    "border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold " +
    "text-black/70 hover:text-black/90 hover:bg-black/10 transition " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10";

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

  const openOrder = () => setView("order");
  const openMenu = () => setView("menu");
  const goAccount = () => setView("account");
  const goLogin = () => setView("login");

  // ✅ Checkout gate:
  // - Kui ostukorvis EI OLE alkoholi -> alati checkout (konto pole nõutud)
  // - Kui ostukorvis ON alkohol -> nõua vanusekinnitust (Smart-ID) enne maksmist
  const goCheckout = () => {
    if (cartCount === 0) return;

    if (cartHasAlcohol && !isAgeVerified) {
      setSmartReason("checkout");
      setView("smartid");
      return;
    }

    setView("checkout");
  };

  // ✅ Konto tegemine / login (DEMO):
  // - Konto loomisel teed Smart-ID -> see kinnitab vanuse ja teeb konto "logged in"
  const startSignupSmartId = () => {
    setSmartReason("signup");
    setView("smartid");
  };

  // Smart-ID: start
  const startSmartId = () => {
    setSmartErr(null);
    const pc = personalCode.replace(/\s/g, "");
    if (!/^\d{11}$/.test(pc)) {
      setSmartErr(
        lang === "et"
          ? "Sisesta 11-kohaline isikukood."
          : "Enter 11-digit personal code.",
      );
      return;
    }

    setSmartIdStep(1);

    // DEMO: waiting -> confirmed
    window.setTimeout(() => setSmartIdStep(2), 2200);
  };

  // Smart-ID: finish
  const finishSmartId = () => {
    setIsAgeVerified(true);

    // ✅ ainult konto loomise puhul salvestame püsivalt
    if (smartReason === "signup") {
      window.localStorage.setItem("demo_age_verified", "1");
      setIsLoggedIn(true);
      window.localStorage.setItem("demo_logged_in", "1");
      setView("account");
      return;
    }

    // ✅ checkout (külaline) -> ära salvesta, kehtib ainult jooksvas sessioonis
    setView("checkout");
  };

  // Persist demo flags
  useEffect(() => {
    const li = window.localStorage.getItem("demo_logged_in");
    const av = window.localStorage.getItem("demo_age_verified");

    if (li === "1") {
      setIsLoggedIn(true);
      if (av === "1") setIsAgeVerified(true); // ✅ vanusekinnitus ainult kontoga
    } else {
      setIsLoggedIn(false);
      setIsAgeVerified(false); // ✅ kui pole kontot, pole ka “kinnitatud”
    }
  }, []);

  const demoLogout = () => {
    setIsLoggedIn(false);
    // NB! vanusekinnitust võid soovi korral ka nullida või mitte.
    // Kui tahad, et ilma kontota peab iga kord uuesti kinnitama, siis nulli ka ageVerified:
    // setIsAgeVerified(false); window.localStorage.removeItem("demo_age_verified");
    window.localStorage.removeItem("demo_logged_in");
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

  // Show sticky ONLY on menu+order
  const needsSticky = view === "menu" || view === "order";

  // Reserve space only when sticky exists
  const stickyReserve = needsSticky
    ? "pb-[calc(200px+env(safe-area-inset-bottom))] sm:pb-[calc(140px+env(safe-area-inset-bottom))]"
    : "pb-[calc(24px+env(safe-area-inset-bottom))]";

  // ✅ theme-aware buttons
  const IconBtnBase =
    "inline-flex items-center justify-center rounded-full " +
    "border border-black/10 bg-black/5 text-black/70 hover:text-black/90 transition " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white/90";

  const PillBase =
    "inline-flex items-center gap-2 rounded-full " +
    "border border-black/10 bg-black/5 px-3 py-2 text-xs font-semibold text-black/70 hover:text-black/90 transition " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white/90";

  const PrimaryPill =
    "inline-flex items-center gap-2 rounded-full bg-blue-500/90 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition disabled:opacity-40 disabled:hover:bg-blue-500/90";

  /* ---------------- DEMO: Checkout timing (slower) ---------------- */
  useEffect(() => {
    if (view !== "checkout") return;

    setCheckoutStep(0);

    const t1 = window.setTimeout(() => setCheckoutStep(1), 900);
    const t2 = window.setTimeout(() => setCheckoutStep(2), 1900);
    const t3 = window.setTimeout(() => setView("confirm"), 3400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [view]);

  return (
    <ClientShell
      title={t.title}
      lang={lang}
      onLangChange={setLang}
      actions={
        <div className={`flex items-center gap-2 ${T.textStrong}`}>
          <ThemeToggle />

          {/* ✅ Account ainult siis kui logged in */}
          {isLoggedIn ? (
            <button onClick={goAccount} className={PillBase} type="button">
              <I.User className="h-4 w-4" />
              {t.account}
            </button>
          ) : (
            <button onClick={goLogin} className={PillBase} type="button">
              <I.Login className="h-4 w-4" />
              {t.login}
            </button>
          )}
        </div>
      }>
      {/* top info */}
      <section className={`${panelClass} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`text-sm ${T.muted}`}>
              {t.table}:{" "}
              <span className={`font-semibold ${T.textStrong}`}>
                {tableCode}
              </span>
            </div>

            <div
              className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${T.faint}`}>
              <span>orgId: {orgId}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <I.Cart className="h-4 w-4" />
                {t.cart}: {cartCount}
              </span>
              <span>•</span>
              <span>{money(cartTotal)}</span>
              {cartHasAlcohol ? (
                <>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 ${
                      isAgeVerified
                        ? "text-green-700 dark:text-green-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}>
                    <I.Shield className="h-4 w-4" />
                    <span>
                      {isAgeVerified
                        ? lang === "et"
                          ? "Vanus kinnitatud"
                          : "Age verified"
                        : lang === "et"
                          ? "Vajab vanusekinnitust"
                          : "Needs age verification"}
                    </span>
                  </span>
                </>
              ) : null}
            </div>

            <a
              href={`/c/${encodeURIComponent(tableCode)}`}
              className={`mt-3 inline-flex text-sm font-semibold ${T.link}`}>
              ← {t.back}
            </a>
          </div>
        </div>
      </section>

      {/* ✅ perks gate (only when NOT logged in) */}
      {!isLoggedIn && (
        <section className={`${panelClass} mt-4 p-4`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            {t.perksTitle}
          </div>

          <div className={`mt-3 ${T.card} p-4`}>
            <div className={`text-sm font-semibold ${T.text}`}>
              {t.perksLockedTitle}
            </div>
            <div className={`mt-1 text-xs ${T.muted}`}>{t.perksLockedDesc}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={goLogin} className={PrimaryPill} type="button">
                <I.Login className="h-4 w-4" />
                {t.loginCta}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* states */}
      {loading && (
        <div className={`${panelClass} mt-4 p-4 text-sm ${T.muted}`}>
          {t.loading}
        </div>
      )}

      {err && (
        <div className={`${panelClass} mt-4 p-4`}>
          <div className="text-sm font-semibold text-red-600 dark:text-red-300">
            Error
          </div>
          <div className={`mt-2 text-xs ${T.muted} break-all`}>{err}</div>

          <div className={`mt-3 text-xs ${T.faint}`}>
            Kontrolli, et need URL-id töötavad:
            <br />
            <code className={`${T.muted}`}>
              /api/backend/categories?organizationId={orgId}
            </code>
            <br />
            <code className={`${T.muted}`}>
              /api/backend/inventory?categoryId=...&organizationId={orgId}
            </code>
          </div>
        </div>
      )}

      {/* SMART-ID VIEW (kas konto loomine või makse-eelne vanusekinnitus) */}
      {!loading && !err && view === "smartid" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            Smart-ID{" "}
            {smartReason === "signup"
              ? lang === "et"
                ? "• Konto"
                : "• Account"
              : lang === "et"
                ? "• Vanus"
                : "• Age"}
          </div>

          <div className={`${T.card} mt-3 p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${T.text}`}>
                  {smartIdStep === 0 && t.smartTitle}
                  {smartIdStep === 1 && t.smartWaiting}
                  {smartIdStep === 2 && t.smartDone}
                </div>

                <div className={`mt-1 text-xs ${T.muted}`}>
                  {smartReason === "checkout" && cartHasAlcohol
                    ? t.alcoholGateDesc
                    : t.smartDesc}
                </div>
              </div>

              <div className={`shrink-0 ${T.muted}`} title="Smart-ID">
                <I.Shield className="h-6 w-6" />
              </div>
            </div>

            {smartIdStep === 0 && (
              <div className="mt-4 grid gap-2">
                <label className={`text-xs font-semibold ${T.faint2}`}>
                  {t.smartCodeLabel}
                </label>
                <input
                  value={personalCode}
                  onChange={(e) => setPersonalCode(e.target.value)}
                  inputMode="numeric"
                  placeholder={t.smartCodePh}
                  className={`h-11 w-full rounded-xl px-3 text-sm outline-none ${T.softBorder} ${T.softBg} ${T.textStrong}`}
                />

                {smartErr && (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-300">
                    {smartErr}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      // tagasi loogika
                      if (smartReason === "checkout") setView("order");
                      else setView("login");
                    }}
                    className={PillBase}
                    type="button">
                    <I.Receipt className="h-4 w-4" />
                    {smartReason === "checkout" ? t.order : t.login}
                  </button>

                  <button
                    onClick={startSmartId}
                    className={PrimaryPill}
                    type="button">
                    <I.Shield className="h-4 w-4" />
                    {t.smartStart}
                  </button>
                </div>
              </div>
            )}

            {smartIdStep === 1 && (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <div className={`${T.muted}`}>
                    <Spinner className="h-6 w-6" />
                  </div>
                  <div className={`text-xs ${T.faint}`}>{t.smartHint}</div>
                </div>

                <div
                  className={`mt-4 h-2 w-full rounded-full ${T.softBg} overflow-hidden`}>
                  <div
                    className="h-full rounded-full bg-blue-500/80 transition-[width] duration-1000"
                    style={{ width: "66%" }}
                  />
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      // katkesta
                      if (smartReason === "checkout") setView("order");
                      else setView("login");
                    }}
                    className={PillBase}
                    type="button">
                    {t.smartCancel}
                  </button>
                </div>
              </div>
            )}

            {smartIdStep === 2 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={finishSmartId}
                  className={PrimaryPill}
                  type="button">
                  <I.Pay className="h-4 w-4" />
                  {t.smartContinue}
                </button>

                <button
                  onClick={() => {
                    if (smartReason === "checkout") setView("order");
                    else setView("menu");
                  }}
                  className={PillBase}
                  type="button">
                  {t.menu}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CHECKOUT VIEW (DEMO Monton) */}
      {!loading && !err && view === "checkout" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            {t.checkoutTitle}
          </div>

          <div className={`${T.card} mt-3 p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${T.text}`}>
                  {checkoutStep === 0 && t.checkoutPrep}
                  {checkoutStep === 1 && t.checkoutOpen}
                  {checkoutStep === 2 && t.checkoutWait}
                </div>

                <div className={`mt-1 text-xs ${T.muted}`}>
                  {t.checkoutDemoHint}
                </div>

                <div className={`mt-3 text-xs ${T.faint}`}>
                  {t.cart}: {cartCount} • {money(cartTotal)}
                </div>
              </div>

              <div className={`shrink-0 ${T.muted}`} title="Loading">
                <Spinner className="h-6 w-6" />
              </div>
            </div>

            <div
              className={`mt-4 h-2 w-full rounded-full ${T.softBg} overflow-hidden`}>
              <div
                className="h-full rounded-full bg-blue-500/80 transition-[width] duration-700"
                style={{ width: `${(checkoutStep + 1) * 33}%` }}
              />
            </div>

            <div className="mt-4">
              <button onClick={() => setView("order")} className={PillBase}>
                <I.Receipt className="h-4 w-4" />
                {t.order}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CONFIRM VIEW */}
      {!loading && !err && view === "confirm" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            {t.confirmTitle}
          </div>

          <div className={`${T.card} mt-3 p-4`}>
            <div className={`text-sm font-semibold ${T.text}`}>
              {t.confirmDesc}
            </div>

            <div className={`mt-2 text-xs ${T.muted}`}>
              {t.cart}: {cartCount} • {money(cartTotal)}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  // optional: clear cart after payment
                  // clearCart();
                  setView("menu");
                }}
                className={PrimaryPill}>
                {t.backToMenu}
              </button>

              <button onClick={() => setView("order")} className={PillBase}>
                <I.Receipt className="h-4 w-4" />
                {t.openOrder}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ACCOUNT / DASHBOARD (only when logged in) */}
      {!loading && !err && view === "account" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                {t.account}
              </div>
              <div className={`mt-1 text-sm font-semibold ${T.text}`}>
                {t.dashTitle}
              </div>
              <div className={`mt-1 text-xs ${T.faint}`}>{t.dashHint}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setView("menu")} className={PillBase}>
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
            <div className={`${T.card} p-4`}>
              <div className={`text-xs ${T.faint2}`}>{t.points}</div>
              <div className={`mt-2 text-2xl font-semibold ${T.text}`}>
                {demoPoints}
              </div>
              <div className={`mt-1 text-xs ${T.faint}`}>
                {t.level}: {demoLevel}
              </div>
            </div>

            <div className={`${T.card} p-4`}>
              <div className={`flex items-center gap-2 text-xs ${T.faint2}`}>
                <I.Gift className="h-4 w-4" />
                {t.perks}
              </div>
              <div className={`mt-2 text-sm font-semibold ${T.text}`}>
                -{discountPct}% {t.discountActive}
              </div>
              <div className={`mt-1 text-xs ${T.faint}`}>
                {t.discountAppliesFrom} {money(discountThreshold)}
              </div>
            </div>

            <div className={`${T.card} p-4`}>
              <div className={`text-xs ${T.faint2}`}>{t.vouchers}</div>
              <div className={`mt-2 text-2xl font-semibold ${T.text}`}>
                {demoVouchers}
              </div>
              <div className={`mt-1 text-xs ${T.faint}`}>DEMO</div>
            </div>
          </div>

          {/* Sections */}
          <div className="mt-4 grid gap-3">
            <div className={`${T.card} p-4`}>
              <div className="flex items-center justify-between gap-3">
                <div className={`text-sm font-semibold ${T.text}`}>
                  {t.recentOrders}
                </div>
                <button onClick={() => setView("order")} className={PillBase}>
                  <I.Receipt className="h-4 w-4" />
                  {t.openOrder}
                </button>
              </div>
              <div className={`mt-2 text-xs ${T.muted}`}>
                (TODO) Näita päris tellimuste ajalugu / “repeat order”.
              </div>
            </div>

            <div className={`${T.card} p-4`}>
              <div className={`text-sm font-semibold ${T.text}`}>
                {t.payment}
              </div>
              <div className={`mt-2 text-xs ${T.muted}`}>
                (TODO) Smart-ID / pangalink / salvestatud makseviisid.
              </div>
            </div>

            <div className={`${T.card} p-4`}>
              <div className={`text-sm font-semibold ${T.text}`}>
                {t.settings}
              </div>
              <div className={`mt-2 text-xs ${T.muted}`}>
                (TODO) Keel, teavitused, “age verification”, profiil.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ORDER VIEW */}
      {!loading && !err && view === "order" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                {t.order}
              </div>
              <div className={`mt-1 text-sm font-semibold ${T.text}`}>
                {cartCount} {t.items} • {money(cartTotal)}
              </div>
              {cartHasAlcohol && !isAgeVerified ? (
                <div className={`mt-2 text-xs ${T.muted}`}>
                  <span className="font-semibold">{t.alcoholGateTitle}:</span>{" "}
                  {t.alcoholGateDesc}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {cartCount > 0 && (
                <button onClick={clearCart} className={PillBase}>
                  <I.Trash className="h-4 w-4" />
                  {t.clear}
                </button>
              )}
              <button onClick={() => setView("menu")} className={PillBase}>
                {t.continueShopping}
              </button>
            </div>
          </div>

          {/* Discount progress */}
          <div className={`mt-4 ${T.card} p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-xs ${T.faint2}`}>{t.discountTitle}</div>

                {cartTotal >= discountThreshold ? (
                  <div className={`mt-1 text-sm font-semibold ${T.text}`}>
                    -{discountPct}% {t.discountActive}
                  </div>
                ) : (
                  <div className={`mt-1 text-sm font-semibold ${T.text}`}>
                    {t.discountUnlockPrefix} {money(missing)}{" "}
                    {t.discountUnlockSuffix} -{discountPct}%
                  </div>
                )}

                <div className={`mt-1 text-xs ${T.faint}`}>
                  {t.discountAppliesFrom} {money(discountThreshold)}
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full ${T.softBorder} ${T.softBg} px-3 py-1 text-[11px] font-semibold ${T.muted}`}>
                {money(cartTotal)} / {money(discountThreshold)}
              </span>
            </div>

            <div
              className={`mt-3 h-2 w-full rounded-full ${T.softBg} overflow-hidden`}>
              <div
                className="h-full rounded-full bg-blue-500/80"
                style={{ width: `${Math.round(discountProgress * 100)}%` }}
              />
            </div>

            {/* ✅ Smart-ID ei ole “login kõrval” – ainult alkoholi korral enne maksmist */}
            {cartHasAlcohol && !isAgeVerified ? (
              <button
                onClick={() => {
                  setSmartReason("checkout");
                  setView("smartid");
                }}
                className={`mt-3 ${PillBase}`}>
                <I.Shield className="h-4 w-4" />
                {t.smartTitle}
              </button>
            ) : null}
          </div>

          {cartLines.length === 0 ? (
            <div className={`mt-4 text-sm ${T.muted}`}>{t.emptyCart}</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {cartLines.map((x) => (
                <div key={x.id} className={`${T.card} p-3`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`font-semibold ${T.text} truncate`}>
                        {x.name}
                      </div>
                      <div className={`mt-1 text-xs ${T.muted}`}>
                        {x.qty} × {money(x.unitPrice)}
                        {isAlcoholCategory(x.categoryName) ? (
                          <span className="ml-2 inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                            <I.Shield className="h-3.5 w-3.5" />{" "}
                            {lang === "et" ? "alkohol" : "alcohol"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className={`shrink-0 text-sm font-semibold ${T.text}`}>
                      {money(x.sum)}
                    </div>
                  </div>

                  {/* compact controls */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => changeQty(x.id, -1)}
                        className={`${IconBtnBase} h-10 w-10`}
                        aria-label="Decrease">
                        <I.Minus className="h-5 w-5" />
                      </button>

                      <div
                        className={`min-w-[38px] text-center text-sm font-semibold ${T.text}`}>
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
              <div
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                {t.cats}
              </div>
              <div className={`text-xs ${T.faint}`}>
                {visibleItems.length} {t.items}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCat("all")}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeCat === "all"
                    ? "bg-blue-500/90 text-white"
                    : "border border-black/10 bg-black/5 text-black/60 hover:text-black/85 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white/85"
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
                      : "border border-black/10 bg-black/5 text-black/60 hover:text-black/85 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white/85"
                  }`}>
                  {name}
                </button>
              ))}
            </div>
          </section>

          {/* products */}
          <section className={`${panelClass} p-4`}>
            <div
              className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
              {t.products}
            </div>

            {visibleItems.length === 0 ? (
              <div className={`mt-3 text-sm ${T.muted}`}>{t.empty}</div>
            ) : (
              <div className="mt-3 grid gap-2">
                {visibleItems
                  .slice()
                  .sort((a, b) => a.productName.localeCompare(b.productName))
                  .map((p) => (
                    <div
                      key={p.productId}
                      className={`${T.card} px-3 py-3 flex items-center justify-between gap-3`}>
                      <div className="min-w-0">
                        <div className={`font-semibold ${T.text}`}>
                          {p.productName}
                        </div>
                        {p.description ? (
                          <div className={`mt-1 text-xs ${T.faint}`}>
                            {p.description}
                          </div>
                        ) : null}
                      </div>

                      <div className="shrink-0 flex items-center gap-3 self-center">
                        <div
                          className={`text-sm font-semibold ${T.text} tabular-nums`}>
                          {money(p.unitPrice)}
                        </div>

                        <button
                          onClick={() => addToCart(p)}
                          className={AddPill}>
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

      {/* LOGIN VIEW (konto tegemine / login -> Smart-ID kinnitab konto) */}
      {!loading && !err && view === "login" && (
        <section className={`${panelClass} mt-4 p-4 ${stickyReserve}`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            {t.login}
          </div>

          <div className={`mt-3 text-sm ${T.muted}`}>
            (DEMO) Konto loomine / login: kinnitame Smart-ID-ga kohe konto ja
            vanuse.
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setView("menu")} className={PillBase}>
              {t.menu}
            </button>

            <button onClick={startSignupSmartId} className={PrimaryPill}>
              <I.Shield className="h-4 w-4" />
              {lang === "et"
                ? "Tee konto Smart-ID-ga"
                : "Create account with Smart-ID"}
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
                  {/* ROW 1 */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <I.Cart className={`h-4 w-4 ${T.muted}`} />

                      {cartCount > 0 ? (
                        <span className="rounded-full bg-blue-500/25 px-2 py-[2px] text-[11px] font-semibold text-blue-900 dark:text-blue-100">
                          {cartCount} {t.items}
                        </span>
                      ) : (
                        <span
                          className={`rounded-full ${T.softBorder} ${T.softBg} px-2 py-[2px] text-[11px] font-semibold ${T.faint}`}>
                          0
                        </span>
                      )}

                      <span className={`text-xs ${T.muted} truncate`}>
                        {t.cart}
                      </span>

                      {cartHasAlcohol ? (
                        <span
                          className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] font-semibold ${
                            isAgeVerified
                              ? "bg-green-500/15 text-green-800 dark:text-green-200"
                              : "bg-amber-500/15 text-amber-800 dark:text-amber-200"
                          }`}>
                          <I.Shield className="h-3.5 w-3.5" />
                          {isAgeVerified
                            ? lang === "et"
                              ? "kinnitatud"
                              : "verified"
                            : lang === "et"
                              ? "vanus"
                              : "age"}
                        </span>
                      ) : null}
                    </div>

                    <div className={`shrink-0 text-sm font-semibold ${T.text}`}>
                      {money(cartTotal)}
                    </div>
                  </div>

                  {/* ROW 2 */}
                  <div className="mt-3 grid grid-cols-[44px_1fr_1fr] gap-2">
                    <button
                      onClick={clearCart}
                      disabled={cartCount === 0}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${T.softBorder} ${T.softBg} ${T.muted} hover:opacity-90 transition disabled:opacity-35`}
                      aria-label={t.clear}
                      title={t.clear}>
                      <I.Trash className="h-5 w-5" />
                    </button>

                    <button
                      onClick={openOrder}
                      className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full ${T.softBorder} ${T.softBg} px-3 text-xs font-semibold ${T.muted} hover:opacity-90 transition`}>
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

                <div className="pointer-events-none mx-auto mt-2 h-1 w-10 rounded-full bg-black/10 dark:bg-white/10 sm:hidden" />
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientShell>
  );
}
