"use client";

import { useEffect, useMemo, useState } from "react";
import type { SVGProps } from "react";
import ClientShell, { panelClass, ThemeToggle } from "../ClientShell";
import { backendUrl } from "@/utils/constants";
import { OrderSession } from "@/app/generated/models/OrderSession";


type Lang = "et" | "en";
type View =
  | "menu"
  | "order"
  | "orderStatus"
  | "login"
  | "account"
  | "smartid"
  | "checkout";

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

type OrderStatus = "received" | "processing" | "finished";

type SubmittedOrderLine = {
  id: string;
  name: string;
  qty: number;
  sum: number;
  unitPrice: number;
};

type SubmittedOrder = {
  id: string;
  createdAt: number;
  total: number;
  status: OrderStatus;
  lines: SubmittedOrderLine[];
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
  "bg-white/85 backdrop-blur-2xl border-t border-black/10 " +
  "dark:bg-white/[0.06] dark:border-white/10";

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
  Check: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}>
      <path
        d="M6 12.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Image: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" {...p}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7 13l2.5-3 3.5 4 2-2 2 3"
        stroke="currentColor"
        strokeWidth="1.6"
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

type SmartIdStep = 0 | 1 | 2;
type SmartIdReason = "signup" | "checkout";

function isAlcoholCategory(categoryName: string) {
  const s = categoryName.toLowerCase().trim();

  if (s.includes("alkovaba")) return false;

  const alcoholCats = [
    "longer",
    "shot",
    "alko",
    "alkohol",
    "õlu",
    "siider",
    "kõik",
    "kokteil",
  ];

  return alcoholCats.some((k) => s.includes(k));
}

export default function ClientMenuPageClient({ tableCode }: { tableCode: string }) {
  const [lang, setLang] = useState<Lang>("et");
  const [view, setView] = useState<View>("menu");

  const [orgId, setOrgId] = useState<number>(2);

  const [cats, setCats] = useState<Category[]>([]);
  const [groups, setGroups] = useState<Record<string, InvDto[]>>({});
  const [activeCat, setActiveCat] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});

  const [submittedOrders, setSubmittedOrders] = useState<SubmittedOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [openProduct, setOpenProduct] = useState<number | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2>(0);

  const [smartIdStep, setSmartIdStep] = useState<SmartIdStep>(0);
  const [personalCode, setPersonalCode] = useState("");
  const [smartErr, setSmartErr] = useState<string | null>(null);
  const [smartReason, setSmartReason] = useState<SmartIdReason>("checkout");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [createAccountWithSmartId, setCreateAccountWithSmartId] =
    useState(false);

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<InvDto | null>(null);

  const [seenReadyOrderIds, setSeenReadyOrderIds] = useState<string[]>([]);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);

  const [showPickupCode, setShowPickupCode] = useState(false);

  const t = useMemo(() => {
    const dict = {
      et: {
        title: "Menüü",
        table: "Laud",
        back: "Tagasi lauale",

        menu: "Menüü",
        order: "Ostukorv",
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
        emptyCart: "Ostukorv on tühi.",
        remove: "Eemalda",

        discountTitle: "Soodustus",
        discountActive: "aktiivne",
        discountUnlockPrefix: "Lisa",
        discountUnlockSuffix: "ja saad",
        discountAppliesFrom: "Aktiveerub alates",
        loginToApply: "Logi sisse, et soodustus rakenduks",

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

        smartTitle: "Jätka Smart-ID-ga",
        smartDesc: "(DEMO) Sisesta isikukood ja kinnita Smart-ID äpis.",
        smartCodeLabel: "Isikukood",
        smartCodePh: "nt 39xxxxxxxxx",
        smartStart: "Alusta Smart-ID",
        smartCancel: "Katkesta",
        smartWaiting: "Ootan kinnitust Smart-ID äpis…",
        smartHint: "Kontrolli telefoni ja kinnita. Kohe liigun edasi.",
        smartDone: "Kinnitatud ✅",
        smartContinue: "Jätka",

        checkoutTitle: "Maksmine",
        checkoutPrep: "Valmistan makse ette…",
        checkoutOpen: "Avan Montonio…",
        checkoutWait: "Ootan makse kinnitust…",
        checkoutDemoHint:
          "(DEMO) Siin läheksid päriselt maksele. Kohe toon tagasi.",
        confirmTitle: "Kinnitamine",
        confirmDesc: "(DEMO) Makse kinnitatud. Tellimus on kinnitatud.",
        backToMenu: "Tagasi menüüsse",

        orderReceivedTitle: "Tellimus vastu võetud",
        orderReceivedDesc: "Hakkame seda kohe valmistama.",
        statusLabel: "Staatus",
        orderReceivedStep: "Tellimus vastu võetud",
        orderProcessingStep: "Tellimust valmistatakse",
        orderFinishedStep: "Tellimus valmis",
        items: "Tooted",
        total: "Kokku",

        alcoholGateTitle: "Vanusekinnitus vajalik",
        alcoholGateDesc:
          "Ostukorvis on alkohol. Enne maksmist on vaja Smart-ID vanusekinnitust. Alkoholita tooteid saab osta ka ilma kontota.",
        discountLoginTitle: "Soodustuse saamiseks logi sisse või tee konto",
        discountLoginDesc: "Püsikliendi boonus aktiveerub kontoga",
        smartVerifiedDesc:
          "Vanusekinnitus on tehtud. Võid nüüd maksmisega jätkata.",
        smartVerifiedSignupDesc:
          "Kinnitus on tehtud. Konto on loodud ja saad jätkata.",
        search: "Otsi jooki",
        searchPh: "Sisesta joogi nimi…",
        details: "Detailid",
        close: "Sulge",
        placeholderTitle: "Pilt puudub",
        placeholderDesc: "Siia tuleb hiljem joogi pilt.",
      },
      en: {
        title: "Menu",
        table: "Table",
        back: "Back to table",

        menu: "Menu",
        order: "Cart",
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
        emptyCart: "Your cart is empty.",
        remove: "Remove",

        discountTitle: "Discount",
        discountActive: "active",
        discountUnlockPrefix: "Add",
        discountUnlockSuffix: "to get",
        discountAppliesFrom: "Applies from",
        loginToApply: "Login to apply discount",

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

        checkoutTitle: "Payment",
        checkoutPrep: "Preparing payment…",
        checkoutOpen: "Opening Montonio…",
        checkoutWait: "Waiting for confirmation…",
        checkoutDemoHint:
          "(DEMO) This would redirect to payment. Coming back soon.",
        confirmTitle: "Confirmation",
        confirmDesc: "(DEMO) Payment confirmed. Order is placed.",
        backToMenu: "Back to menu",

        orderReceivedTitle: "Order received",
        orderReceivedDesc: "We’ll start preparing it shortly.",
        statusLabel: "Status",
        orderReceivedStep: "Order received",
        orderProcessingStep: "Order is being prepared",
        orderFinishedStep: "Order finished",
        items: "Items",
        total: "Total",

        alcoholGateTitle: "Age verification required",
        alcoholGateDesc:
          "Your cart contains alcohol. Smart-ID age verification is required before payment. Non-alcohol items can be purchased without an account.",
        discountLoginTitle: "Login or create an account to unlock discounts",
        discountLoginDesc: "Member discounts become active with an account",
        smartVerifiedDesc:
          "Age verification is complete. You can now continue to checkout.",
        smartVerifiedSignupDesc:
          "Verification is complete. Your account has been created and you can continue.",
        search: "Search drink",
        searchPh: "Type drink name…",
        details: "Details",
        close: "Close",
        placeholderTitle: "No image yet",
        placeholderDesc: "Drink image will appear here later.",
      },
    } as const;

    return dict[lang];
  }, [lang]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const productMetaById = useMemo(() => {
    const map = new Map<string, { p: InvDto; categoryName: string }>();
    for (const [catName, arr] of Object.entries(groups)) {
      for (const p of arr) {
        map.set(String(p.productId), { p, categoryName: catName });
      }
    }
    return map;
  }, [groups]);

  const productById = useMemo(() => {
    const map = new Map<string, InvDto>();
    for (const v of productMetaById.values()) {
      map.set(String(v.p.productId), v.p);
    }
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

  const selectedQty = selectedProduct
    ? cart[String(selectedProduct.productId)] || 0
    : 0;

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

  const activeOrder = useMemo(() => {
    return submittedOrders[0] ?? null;
  }, [submittedOrders]);

  const accountReadyOrder = useMemo(() => {
    if (!activeOrder || activeOrder.status !== "finished") return null;
    if (seenReadyOrderIds.includes(activeOrder.id)) return null;
    return activeOrder;
  }, [activeOrder, seenReadyOrderIds]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return submittedOrders.find((o) => o.id === selectedOrderId) ?? null;
  }, [submittedOrders, selectedOrderId]);

  const orderStatusOrder = useMemo(() => {
    if (selectedOrder) return selectedOrder;
    return submittedOrders[0] ?? null;
  }, [selectedOrder, submittedOrders]);

  const pickupCode = orderStatusOrder
    ? orderStatusOrder.id.replace("ORD-", "").slice(-4)
    : "";

  const readyOrder = useMemo(() => {
    if (!activeOrder || activeOrder.status !== "finished") return null;
    if (seenReadyOrderIds.includes(activeOrder.id)) return null;
    return activeOrder;
  }, [activeOrder, seenReadyOrderIds]);

  const inProgressOrder = useMemo(() => {
    return (
      submittedOrders.find(
        (o) => o.status === "received" || o.status === "processing",
      ) ?? null
    );
  }, [submittedOrders]);

  useEffect(() => {
    const getSessionId = async () => {
      try {
        const res = await fetch("/api/backend/sessions", { cache: "no-store" });
        if (!res.ok) return;
        const sessions: OrderSession[] = await res.json();

        if (sessions.length === 0) return;

        const orderedSessions = sessions.sort((a, b) => a.createdTime - b.createdTime)

        const newest = orderedSessions[orderedSessions.length - 1];
        setSessionId(newest.sessionId);
      } catch (e) {
        console.error("Failed to recover orders", e);
      }
    };
    
    getSessionId();
  }, []);

  useEffect(() => {
    if (!sessionId || submittedOrders.length > 0) return;


    const recoverOrder = async () => {
      try {
        const res = await fetch("/api/backend/orders", { cache: "no-store" });
        if (!res.ok) return;
        type OrderPayload = {
          id: number;
          sessionId: string;
          createdAt?: string;
          total?: number;
          state?: string;
          products?: Array<{
            productId: number;
            productName?: string;
            quantity: number;
            unitPrice: number;
          }>;
        };
        const allOrders: OrderPayload[] = await res.json();
        
        const myOrders = allOrders.filter((o) => o.sessionId === sessionId);
        
        if (myOrders.length > 0) {
          const restoredOrders: SubmittedOrder[] = myOrders.map((data) => ({
            id: String(data.id),
            createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
            total: data.total ?? 0,
            status: mapBackendState(data.state ?? "ORDER_CONFIRMED"),
            lines: (data.products || []).map((p) => ({
              id: String(p.productId),
              name: p.productName || "Toode",
              qty: p.quantity,
              sum: p.quantity * p.unitPrice,
              unitPrice: p.unitPrice,
            })),
          }));
          
          setSubmittedOrders(restoredOrders);
          setSelectedOrderId(restoredOrders[restoredOrders.length - 1].id);
          setView("orderStatus");
        }
      } catch (e) {
        console.error("Failed to recover orders", e);
      }
    };
    
    recoverOrder();
  }, [sessionId, submittedOrders.length]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("orgId");
    if (q && !Number.isNaN(Number(q))) setOrgId(Number(q));
  }, []);

  useEffect(() => {
    if (view !== "smartid") return;
    setSmartIdStep(0);
    setPersonalCode("");
    setSmartErr(null);
  }, [view]);

  useEffect(() => {
    if (view !== "orderStatus") {
      setShowPickupCode(false);
    }
  }, [view]);

  useEffect(() => {
    if (!selectedProduct) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedProduct]);

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
  }, [orgId]);

  const visibleCategoryNames = useMemo(() => {
    const names = cats.map((c) => c.name);
    return names.filter((n) => (groups[n] ?? []).length > 0);
  }, [cats, groups]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base =
      q.length > 0
        ? visibleCategoryNames.flatMap((name) => groups[name] ?? [])
        : activeCat === "all"
          ? visibleCategoryNames.flatMap((name) => groups[name] ?? [])
          : (groups[activeCat] ?? []);

    if (!q) return base;

    return base.filter((item) =>
      `${item.productName} ${item.description}`.toLowerCase().includes(q),
    );
  }, [activeCat, groups, visibleCategoryNames, search]);

  const AddPill =
    "inline-flex items-center gap-2 rounded-full " +
    "border border-black/10 bg-black/5 px-4 py-2 text-sm font-semibold " +
    "text-black/70 hover:text-black/90 hover:bg-black/10 transition " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10";

  const changeQty = (pid: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      const cur = next[pid] || 0;
      const v = cur + delta;

      if (v <= 0) {
        delete next[pid];
        if (openProduct === Number(pid)) {
          setOpenProduct(null);
        }
      } else {
        next[pid] = v;
      }

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
  const openMenu = () => {
    setOpenProduct(null);
    setView("menu");
  };
  const goAccount = () => setView("account");
  const goLogin = () => setView("login");

  const openSubmittedOrder = (orderId?: string) => {
    const id = orderId ?? activeOrder?.id;
    if (!id) return;

    const order = submittedOrders.find((o) => o.id === id);

    if (order?.status === "finished") {
      setSeenReadyOrderIds((prev) =>
        prev.includes(id) ? prev : [...prev, id],
      );
    }

    setSelectedOrderId(id);
    setView("orderStatus");
  };



  const goCheckout = () => {
    if (cartCount === 0) return;

    if (cartHasAlcohol && !isAgeVerified) {
      setSmartReason("checkout");
      setView("smartid");
      return;
    }

    setView("checkout");
  };

  const startSignupSmartId = () => {
    setSmartReason("signup");
    setView("smartid");
  };

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

    window.setTimeout(() => {
      setIsAgeVerified(true);
      window.localStorage.setItem("demo_age_verified", "1");

      setIsLoggedIn(true);
      window.localStorage.setItem("demo_logged_in", "1");

      if (smartReason === "signup") {
        setView("account");
        return;
      }

      setCheckoutNotice(
        lang === "et"
          ? "Konto on loodud ja liigud maksmisele."
          : "Your account has been created and you are being redirected to payment.",
      );

      setView("checkout");
    }, 2200);
  };

  const finishSmartId = () => {
    setIsAgeVerified(true);
    window.localStorage.setItem("demo_age_verified", "1");

    setIsLoggedIn(true);
    window.localStorage.setItem("demo_logged_in", "1");

    setView("checkout");
  };

  useEffect(() => {
    const li = window.localStorage.getItem("demo_logged_in");
    const av = window.localStorage.getItem("demo_age_verified");

    if (li === "1") {
      setIsLoggedIn(true);
      if (av === "1") setIsAgeVerified(true);
    } else {
      setIsLoggedIn(false);
      setIsAgeVerified(false);
    }
  }, []);

  const demoLogout = () => {
    setIsLoggedIn(false);
    setIsAgeVerified(false);
    setSmartIdStep(0);
    setPersonalCode("");
    setSmartErr(null);

    window.localStorage.removeItem("demo_logged_in");
    window.localStorage.removeItem("demo_age_verified");

    setView("menu");
  };

  const discountThreshold = 20;
  const discountPct = 5;
  const discountProgress = Math.min(cartTotal / discountThreshold, 1);
  const missing = Math.max(discountThreshold - cartTotal, 0);

  const demoPoints = 120;
  const demoLevel = "Silver";
  const demoVouchers = 2;

  const needsSticky =
    view === "menu" ||
    view === "order" ||
    view === "account" ||
    view === "orderStatus";

  const stickyReserve = needsSticky
    ? "pb-[calc(108px+env(safe-area-inset-bottom))]"
    : "pb-[calc(24px+env(safe-area-inset-bottom))]";

  const IconBtnBase =
    "inline-flex items-center justify-center rounded-full " +
    "border border-black/10 bg-black/5 text-black/70 hover:text-black/90 transition " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white/90";

  const PillBase =
    "inline-flex items-center justify-center gap-2 rounded-full " +
    "border border-black/10 bg-black/5 px-3 py-2 text-sm font-semibold text-black/70 hover:text-black/90 transition " +
    "dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:text-white/90";

  const PrimaryPill =
    "inline-flex items-center justify-center gap-2 rounded-full bg-blue-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-40 disabled:hover:bg-blue-500/90";

  const startLoginFlow = () => {
    setSmartReason("signup");
    setView("smartid");
  };

  useEffect(() => {
    if (view !== "checkout") return;

    let cancelled = false;

    const sendOrder = async () => {
      setCheckoutStep(0);

      const body = {
        desk: tableCode,
        clientName: "Guest",
        state: "ORDER_CONFIRMED",
        total: cartTotal,
        products: cartLines.map((x) => ({
          productId: Number(x.id),
          quantity: x.qty,
        })),
      };

      try {
        setCheckoutStep(1);

        const res = await fetch("/api/backend/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Order failed: ${res.status} — ${errText}`);
        }

        const data = await res.json();

        if (cancelled) return;

        // sessionId from the response wires up the WebSocket listener
        if (data.sessionId) setSessionId(data.sessionId);

        const backendOrderId = String(data.id);

        const newOrder: SubmittedOrder = {
          id: backendOrderId,
          createdAt: data.createdAt ? new Date(data.createdAt).getTime() : Date.now(),
          total: data.total ?? cartTotal,
          status: mapBackendState(data.state ?? "ORDER_CONFIRMED"),
          lines: cartLines.map((x) => ({
            id: x.id,
            name: x.name,
            qty: x.qty,
            sum: x.sum,
            unitPrice: x.unitPrice,
          })),
        };

        setSubmittedOrders((prev) => [newOrder, ...prev]);
        setSelectedOrderId(backendOrderId);
        setCheckoutStep(2);

        await new Promise((r) => setTimeout(r, 800));

        if (cancelled) return;

        clearCart();
        setView("orderStatus");
      } catch (e) {
        if (cancelled) return;
        console.error("Order error:", e);
        setErr(e instanceof Error ? e.message : "Failed to place order");
        setView("order");
      }
    };

    sendOrder();

    return () => {
      cancelled = true;
    };
  }, [view]);

  const mapBackendState = (state: string): OrderStatus => {
    switch (state) {
      case "ORDER_CONFIRMED":
        return "received";
      case "IN_MAKING":
        return "processing";
      case "READY_FOR_PICKUP":
        return "finished";
      case "ORDER_COMPLETE":
        return "finished";
      default:
        return "received";
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const formattedBackendUrl = backendUrl?.replace(/^https?:\/\//, "");
    const ws = new WebSocket(
      `${protocol}://${formattedBackendUrl}/ws/order-status?token=${sessionId}`
    );

    ws.onopen = () => {
      console.log("WS connected for table:", sessionId);
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);

        setSubmittedOrders((prev) =>
          prev.map((o) => {
            return Number(o.id) === update.orderId 
              ? {...o, status: mapBackendState(update.status) ?? update.status,}
              : o
          }
          )
        );
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed for table:", sessionId);
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);



  return (
    <ClientShell
      title={view === "menu" ? t.title : ""}
      lang={lang}
      onLangChange={setLang}
      onLogoClick={() => {
        setSelectedProduct(null);
        setOpenProduct(null);
        setView("menu");
      }}
      actions={
        <div className={`flex items-center gap-2 ${T.textStrong}`}>
          <ThemeToggle />

          {isLoggedIn ? (
            <button onClick={goAccount} className={PillBase} type="button">
              <I.User className="h-5 w-5" />
              {t.account}
            </button>
          ) : (
            <button onClick={startLoginFlow} className={PillBase} type="button">
              <I.Login className="h-5 w-5" />
              {t.login}
            </button>
          )}
        </div>
      }>
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          <div className="p-4 text-sm">{t.loading}</div>
        </div>
      )}

      {err && (
        <div className={`${panelClass} mt-4 p-4`}>
          <div className="text-sm font-semibold text-red-600 dark:text-red-300">
            Error
          </div>
          <div className={`mt-2 text-sm ${T.muted} break-all`}>{err}</div>

          <div className={`mt-3 text-sm ${T.faint}`}>
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

      {!loading && !err && view === "smartid" && (
        <section className={`p-4 ${stickyReserve}`}>
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
                <div className={`text-md font-semibold ${T.text}`}>
                  {smartIdStep === 0 && t.smartTitle}
                  {smartIdStep === 1 && t.smartWaiting}
                  {smartIdStep === 2 && t.smartDone}
                </div>

                <div className={`mt-1 text-xs ${T.muted}`}>
                  {smartIdStep === 2
                    ? smartReason === "signup" || createAccountWithSmartId
                      ? t.smartVerifiedSignupDesc
                      : t.smartVerifiedDesc
                    : smartReason === "checkout" && cartHasAlcohol
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
                <label className={`text-md font-semibold ${T.faint2}`}>
                  {t.smartCodeLabel}
                </label>
                <input
                  value={personalCode}
                  onChange={(e) => {
                    const onlyDigits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);
                    setPersonalCode(onlyDigits);
                  }}
                  inputMode="numeric"
                  maxLength={11}
                  placeholder={t.smartCodePh}
                  className={`h-11 w-full rounded-xl px-3 text-sm outline-none ${T.softBorder} ${T.softBg} ${T.textStrong}`}
                />

                <div
                  className={`mt-1 text-sm font-semibold transition-colors duration-200 ${
                    personalCode.length === 11
                      ? "text-green-500"
                      : "text-blue-500"
                  }`}>
                  {personalCode.length} / 11
                </div>

                <label className="mt-2 flex items-start gap-3 rounded-2xl border border-black/10 bg-black/5 p-3 text-sm dark:border-white/10 dark:bg-white/5">
                  <input
                    type="checkbox"
                    checked={createAccountWithSmartId}
                    onChange={(e) =>
                      setCreateAccountWithSmartId(e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-black/20 text-blue-500 focus:ring-blue-500 dark:border-white/20"
                  />

                  <span className="leading-5 text-black/75 dark:text-white/75">
                    {lang === "et"
                      ? "Loo mulle konto sama kinnitusega"
                      : "Create an account with the same verification"}
                  </span>
                </label>

                {smartErr && (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-300">
                    {smartErr}
                  </div>
                )}

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      if (smartReason === "checkout") setView("order");
                      else setView("login");
                    }}
                    className={PillBase}
                    type="button">
                    <I.Receipt className="h-5 w-5" />
                    {smartReason === "checkout"
                      ? t.order
                      : lang === "et"
                        ? "Tagasi"
                        : "Back"}
                  </button>

                  <button
                    onClick={startSmartId}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition duration-150 hover:bg-blue-600 active:scale-[0.98] active:bg-blue-700 disabled:opacity-40"
                    type="button">
                    <I.Shield className="h-5 w-5" />
                    <span>
                      {lang === "et"
                        ? "Jätka Smart-ID-ga"
                        : "Continue with Smart-ID"}
                    </span>
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

            {smartIdStep === 2 && smartReason === "signup" && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setView("menu");
                  }}
                  className={PillBase}
                  type="button">
                  {t.menu}
                </button>

                <button
                  onClick={finishSmartId}
                  className={PrimaryPill}
                  type="button">
                  <I.Pay className="h-5 w-5" />
                  {t.smartContinue}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && !err && view === "checkout" && (
        <section className={`p-4 ${stickyReserve}`}>
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

                <div className={`mt-1 text-sm ${T.muted}`}>
                  {t.checkoutDemoHint}
                </div>

                {checkoutNotice && (
                  <div className={`mt-2 text-xs text-green-500`}>
                    {checkoutNotice}
                  </div>
                )}

                <div className={`mt-3 text-sm ${T.faint}`}>
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
                <I.Receipt className="h-5 w-5" />
                {t.order}
              </button>
            </div>
          </div>
        </section>
      )}

      {!loading && !err && view === "orderStatus" && orderStatusOrder && (
        <section className={`p-4 ${stickyReserve}`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            {t.openOrder}
          </div>

          <div className={`${T.card} mt-3 p-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={`text-base font-semibold ${T.text}`}>
                  {lang === "et" ? "Sinu tellimus" : "Your order"}
                </div>
                <div className={`mt-1 text-sm ${T.muted}`}>
                  {t.statusLabel}:{" "}
                  {orderStatusOrder.status === "received"
                    ? t.orderReceivedStep
                    : orderStatusOrder.status === "processing"
                      ? t.orderProcessingStep
                      : t.orderFinishedStep}
                </div>
              </div>

              <div
                className={`shrink-0 rounded-full px-4 py-2 text-base font-bold ${
                  orderStatusOrder.status === "finished"
                    ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-white shadow-[0_10px_28px_rgba(16,185,129,0.24)] order-ready-attention"
                    : orderStatusOrder.status === "processing"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-blue-500/15 text-blue-400"
                }`}>
                {orderStatusOrder.status === "received"
                  ? t.orderReceivedStep
                  : orderStatusOrder.status === "processing"
                    ? t.orderProcessingStep
                    : t.orderFinishedStep}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                { key: "received", label: t.orderReceivedStep },
                { key: "processing", label: t.orderProcessingStep },
                { key: "finished", label: t.orderFinishedStep },
              ].map((step, index) => {
                const done =
                  (orderStatusOrder.status === "received" && index <= 0) ||
                  (orderStatusOrder.status === "processing" && index <= 1) ||
                  (orderStatusOrder.status === "finished" && index <= 2);

                const current =
                  (orderStatusOrder.status === "received" && index === 0) ||
                  (orderStatusOrder.status === "processing" && index === 1) ||
                  (orderStatusOrder.status === "finished" && index === 2);

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        done
                          ? current && orderStatusOrder.status === "processing"
                            ? "bg-amber-500/20 text-amber-400"
                            : step.key === "finished" &&
                                orderStatusOrder.status === "finished"
                              ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-white shadow-[0_8px_24px_rgba(16,185,129,0.22)] order-ready-attention"
                              : "bg-green-500/20 text-green-500"
                          : `${T.softBg} ${T.faint}`
                      }`}>
                      {done ? (
                        <I.Check className="h-5 w-5" />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-current opacity-60" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`mt-2 ${
                          step.key === "finished" &&
                          orderStatusOrder.status === "finished"
                            ? "text-base font-bold text-green-400"
                            : `text-base font-semibold ${T.text}`
                        }`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowPickupCode(true)}
              className={`${PillBase} w-full justify-center`}>
              <I.Receipt className="h-5 w-5" />
              {lang === "et" ? "Näita baarile" : "Show at bar"}
            </button>
          </div>

          <div className={`${T.card} mt-3 p-4`}>
            <div className={`text-sm font-semibold ${T.text}`}>{t.items}</div>

            <div className="mt-3 grid gap-2">
              {orderStatusOrder.lines.map((x) => (
                <div
                  key={x.id}
                  className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${T.text}`}>
                      {x.name}
                    </div>
                    <div className={`mt-1 text-sm ${T.faint}`}>
                      {x.qty} × {money(x.unitPrice)}
                    </div>
                  </div>

                  <div className={`shrink-0 text-sm font-semibold ${T.text}`}>
                    {money(x.sum)}
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-4 border-t border-black/10 pt-4 dark:border-white/10`}>
              <div className="flex items-center justify-between gap-3">
                <div className={`text-sm ${T.muted}`}>{t.total}</div>
                <div className={`text-base font-semibold ${T.text}`}>
                  {money(orderStatusOrder.total)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && !err && view === "account" && (
        <section className={`p-4 ${stickyReserve}`}>
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
          </div>

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

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 ring-1 ring-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:ring-blue-500/10">
              <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-200">
                <I.Gift className="h-4 w-4" />
                {t.perks}
              </div>

              <div className="mt-2 text-sm font-semibold text-blue-950 dark:text-blue-100">
                -{discountPct}% {t.discountActive}
              </div>

              <div className="mt-1 text-xs text-blue-700/80 dark:text-blue-200/80">
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

          <div className="mt-4 grid gap-3">
            <div className={`${T.card} p-4`}>
              <div className={`text-sm font-semibold ${T.text}`}>
                {t.recentOrders}
              </div>

              {activeOrder && (
                <button
                  onClick={() => openSubmittedOrder(activeOrder.id)}
                  className={`mt-3 w-full rounded-2xl ${T.softBorder} p-3 text-left transition hover:opacity-95 ${
                    accountReadyOrder
                      ? "bg-gradient-to-r from-emerald-500/12 via-green-500/10 to-emerald-400/12 order-ready-attention"
                      : `${T.softBg}`
                  }`}
                  type="button">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={`text-sm font-semibold ${T.text}`}>
                        {lang === "et" ? "Kood" : "Code"}:{" "}
                        {activeOrder.id.replace("ORD-", "").slice(-4)}
                      </div>

                      <div className={`mt-1 text-xs ${T.muted}`}>
                        {activeOrder.status === "received"
                          ? t.orderReceivedStep
                          : activeOrder.status === "processing"
                            ? t.orderProcessingStep
                            : t.orderFinishedStep}
                      </div>
                    </div>

                    <div
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        activeOrder.status === "finished"
                          ? seenReadyOrderIds.includes(activeOrder.id)
                            ? `${T.softBg} ${T.faint}`
                            : "bg-green-500/15 text-green-500"
                          : activeOrder.status === "processing"
                            ? "bg-amber-500/15 text-amber-400"
                            : `${T.softBg} ${T.faint}`
                      }`}>
                      {activeOrder.status === "received"
                        ? t.orderReceivedStep
                        : activeOrder.status === "processing"
                          ? t.orderProcessingStep
                          : t.orderFinishedStep}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className={`text-sm ${T.faint}`}>
                      {money(activeOrder.total)}
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                        accountReadyOrder
                          ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-white shadow-[0_8px_24px_rgba(16,185,129,0.22)]"
                          : "text-blue-500"
                      }`}>
                      {accountReadyOrder ? (
                        <>
                          <I.Check className="h-5 w-5" />
                          {lang === "et" ? "Tellimus valmis" : "Order ready"}
                        </>
                      ) : (
                        <>
                          <I.Receipt className="h-5 w-5" />
                          {lang === "et" ? "Vaata tellimust" : "View order"}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              )}

              <div className="mt-3 grid gap-2">
                {submittedOrders.length === 0 ? (
                  <div className={`text-xs ${T.muted}`}>
                    (TODO) Näita päris tellimuste ajalugu / “repeat order”.
                  </div>
                ) : (
                  submittedOrders
                    .filter(
                      (order) => !activeOrder || order.id !== activeOrder.id,
                    )
                    .map((order) => (
                      <button
                        key={order.id}
                        onClick={() => openSubmittedOrder(order.id)}
                        className={`w-full rounded-2xl ${T.softBg} ${T.softBorder} p-3 text-left transition hover:opacity-90`}
                        type="button">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className={`text-sm font-semibold ${T.text}`}>
                              {lang === "et" ? "Kood" : "Code"}:{" "}
                              {order.id.replace("ORD-", "").slice(-4)}
                            </div>
                            <div className={`mt-1 text-xs ${T.muted}`}>
                              {new Date(order.createdAt).toLocaleString(
                                lang === "et" ? "et-EE" : "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div className={`text-sm font-semibold ${T.text}`}>
                              {money(order.total)}
                            </div>
                            <div
                              className={`mt-1 text-xs font-semibold ${
                                order.status === "finished"
                                  ? "text-green-500"
                                  : order.status === "processing"
                                    ? "text-amber-400"
                                    : "text-blue-400"
                              }`}>
                              {order.status === "received"
                                ? t.orderReceivedStep
                                : order.status === "processing"
                                  ? t.orderProcessingStep
                                  : t.orderFinishedStep}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                )}
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

      {!loading && !err && view === "order" && (
        <section className={`p-4 ${stickyReserve}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                {t.order}
              </div>
              {cartHasAlcohol && !isAgeVerified ? (
                <div className={`mt-2 text-md ${T.muted}`}>
                  <span className="font-semibold"></span> {t.alcoholGateDesc}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div
                      className={`flex items-center gap-2 text-md font-semibold ${T.faint2}`}>
                      <I.Gift className="h-6 w-6 text-blue-400" />
                      {t.discountTitle}
                    </div>

                    {cartTotal >= discountThreshold ? (
                      <div
                        className={`mt-1 text-md font-semibold ${T.textStrong}`}>
                        -{discountPct}% {t.discountActive}
                      </div>
                    ) : (
                      <div
                        className={`mt-1 text-md font-semibold ${T.textStrong}`}>
                        {t.discountUnlockPrefix} {money(missing)}{" "}
                        {t.discountUnlockSuffix} -{discountPct}%
                      </div>
                    )}

                    <div className={`mt-1 text-md ${T.faint}`}>
                      {t.discountAppliesFrom} {money(discountThreshold)}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-200">
                    {money(cartTotal)} / {money(discountThreshold)}
                  </span>
                </div>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${Math.round(discountProgress * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <div
                    className={`flex items-center gap-2 text-md font-semibold ${T.faint2}`}>
                    <I.Gift className="h-6 w-6 text-blue-400" />
                    {t.discountTitle}
                  </div>

                  <div className={`mt-1 text-sm font-semibold ${T.textStrong}`}>
                    {t.discountLoginTitle}
                  </div>

                  <div className={`mt-1 text-xs ${T.faint}`}>
                    {t.discountLoginDesc}
                  </div>
                </div>

                <div className="grid gap-2 grid-cols-1">
                  {cartHasAlcohol && !isAgeVerified && (
                    <button
                      onClick={() => {
                        setSmartReason("checkout");
                        setView("smartid");
                      }}
                      className={`${PillBase} w-full`}
                      type="button">
                      <I.Shield className="h-5 w-5" />
                      {t.smartTitle}
                    </button>
                  )}
                </div>
              </div>
            )}
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
                    </div>
                    <div className={`shrink-0 text-sm font-semibold ${T.text}`}>
                      {money(x.sum)}
                    </div>
                  </div>

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

      {!loading && !err && view === "menu" && (
        <div className={`mt-4 grid gap-4 ${stickyReserve}`}>
          <section className="p-4 pt-0">
            <div
              className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
              {t.search}
            </div>

            <div className="mt-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPh}
                className={`h-11 w-full rounded-2xl px-4 text-sm outline-none ${T.softBorder} ${T.softBg} ${T.textStrong}`}
              />
            </div>
          </section>
          <section className={`p-4 pt-0`}>
            <div className="flex items-center justify-between">
              <div
                className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                {t.cats}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCat("all")}
                className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
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
                  className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                    activeCat === name
                      ? "bg-blue-500/90 text-white"
                      : "border border-black/10 bg-black/5 text-black/60 hover:text-black/85 dark:border-white/10 dark:bg-white/5 dark:text-white/60 dark:hover:text-white/85"
                  }`}>
                  {name}
                </button>
              ))}
            </div>
          </section>

          <section className={`p-4 pt-0`}>
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
                  .map((p) => {
                    return (
                      <div key={p.productId} className={`${T.card} px-3 py-3`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(p)}
                              className={`text-left font-semibold ${T.text} hover:underline`}>
                              {p.productName}
                            </button>

                            {p.description && (
                              <div className={`mt-1 text-xs ${T.faint}`}>
                                {p.description}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            <div
                              className={`text-m font-semibold ${T.text} tabular-nums`}>
                              {money(p.unitPrice)}
                            </div>

                            <button
                              onClick={() => {
                                const pid = String(p.productId);
                                const currentQty = cart[pid] || 0;

                                if (currentQty === 0) {
                                  changeQty(pid, +1);
                                  setOpenProduct(p.productId);
                                } else {
                                  setOpenProduct(
                                    openProduct === p.productId
                                      ? null
                                      : p.productId,
                                  );
                                }
                              }}
                              className={
                                (cart[String(p.productId)] || 0) > 0
                                  ? "inline-flex items-center gap-2 rounded-full bg-blue-500/90 px-2 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                                  : AddPill
                              }>
                              {(cart[String(p.productId)] || 0) > 0 ? (
                                <I.Check className="h-5 w-5" />
                              ) : (
                                <>
                                  <I.Plus className="h-5 w-5" />
                                  {t.add}
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {openProduct === p.productId &&
                          (cart[String(p.productId)] || 0) > 0 && (
                            <div className="mt-3 flex items-center justify-end">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    changeQty(String(p.productId), -1)
                                  }
                                  className="flex h-11 w-11 items-center justify-center rounded-full 
  bg-black/10 dark:bg-white/10 
  transition duration-150 select-none touch-manipulation
  hover:bg-black/15 dark:hover:bg-white/15
  active:scale-95 active:bg-black/30 dark:active:bg-white/25">
                                  <I.Minus className="h-5 w-5" />
                                </button>

                                <span className="min-w-[20px] text-center text-md font-semibold">
                                  {cart[String(p.productId)] || 0}
                                </span>

                                <button
                                  onClick={() =>
                                    changeQty(String(p.productId), +1)
                                  }
                                  className="flex h-11 w-11 items-center justify-center rounded-full 
  bg-black/10 dark:bg-white/10 
  transition duration-150 select-none touch-manipulation
  hover:bg-black/15 dark:hover:bg-white/15
  active:scale-95 active:bg-black/30 dark:active:bg-white/25">
                                  <I.Plus className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>
      )}

      {!loading && !err && view === "login" && (
        <section className={`p-4 ${stickyReserve}`}>
          <div
            className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
            {t.login}
          </div>

          <div className={`mt-3 text-sm ${T.muted}`}>
            {lang === "et"
              ? "(DEMO) Kui sul on konto olemas, logid sisse Smart-ID-ga. Kui kontot veel ei ole, luuakse see sama kinnituse käigus."
              : "(DEMO) If you already have an account, Smart-ID signs you in. If you do not have one yet, it will be created during the same confirmation."}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setView("menu")} className={PillBase}>
              {t.menu}
            </button>

            <button onClick={startSignupSmartId} className={PrimaryPill}>
              <I.Shield className="h-5 w-5" />
              {lang === "et" ? "Jätka Smart-ID-ga" : "Continue with Smart-ID"}
            </button>
          </div>
        </section>
      )}

      {selectedProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedProduct(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${contentMax} rounded-3xl border border-black/10 bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-[#20283a] dark:ring-white/10`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                  {t.details}
                </div>
                <div className={`mt-1 text-lg font-semibold ${T.textStrong}`}>
                  {selectedProduct.productName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label={t.close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/70 transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex aspect-[16/10] items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 px-4 text-center text-black/45 dark:text-white/45">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                    aria-hidden="true">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M7 13l2.5-3 3.5 4 2-2 2 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div className="text-xs">{t.placeholderDesc}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <div className={`text-xs font-semibold ${T.faint2}`}>
                  {lang === "et" ? "Kirjeldus" : "Description"}
                </div>
                <div className={`mt-1 text-sm ${T.muted}`}>
                  {selectedProduct.description ||
                    (lang === "et"
                      ? "Kirjeldus puudub."
                      : "No description available.")}
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                {/* HIND */}
                <div className="flex flex-col">
                  <div className={`text-base font-semibold ${T.textStrong}`}>
                    {money(
                      (selectedQty > 0 ? selectedQty : 1) *
                        selectedProduct.unitPrice,
                    )}
                  </div>

                  <div className={`text-xs ${T.faint}`}>
                    {money(selectedProduct.unitPrice)} / tk
                  </div>
                </div>

                {/* KOGUS paremal */}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const pid = String(selectedProduct.productId);
                      changeQty(pid, -1);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full
      bg-black/10 dark:bg-white/10 
      transition duration-150 select-none touch-manipulation
      hover:bg-black/15 dark:hover:bg-white/15
      active:scale-95 active:bg-black/30 dark:active:bg-white/25">
                    <I.Minus className="h-5 w-5" />
                  </button>

                  <span
                    className={`min-w-[24px] text-center text-sm font-semibold ${T.textStrong}`}>
                    {selectedQty}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const pid = String(selectedProduct.productId);
                      changeQty(pid, 1);
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-full
      bg-black/10 dark:bg-white/10 
      transition duration-150 select-none touch-manipulation
      hover:bg-black/15 dark:hover:bg-white/15
      active:scale-95 active:bg-black/30 dark:active:bg-white/25">
                    <I.Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPickupCode && orderStatusOrder && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPickupCode(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${contentMax} rounded-3xl border border-black/10 bg-white p-6 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-[#20283a] dark:ring-white/10`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${T.faint2}`}>
                  {lang === "et" ? "Näita baaris" : "Show at bar"}
                </div>

                <div className={`mt-2 text-sm ${T.muted}`}>
                  {lang === "et"
                    ? "Näita seda koodi baaritöötajale."
                    : "Show this code to the bartender."}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPickupCode(false)}
                aria-label={t.close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/70 transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center rounded-3xl border border-black/10 bg-black/[0.04] px-6 py-8 dark:border-white/10 dark:bg-white/[0.04]">
              <div
                className={`text-4xl font-bold tracking-[0.2em] ${T.textStrong}`}>
                {pickupCode}
              </div>
            </div>
          </div>
        </div>
      )}

      {needsSticky && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className={`mx-auto w-full ${contentMax}`}>
            <div className="pointer-events-none absolute inset-x-0 -top-3 h-10 bg-blue-500/12 blur-2xl" />

            <div className={`${panelSoft} relative`}>
              <div className="px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                {view === "account" ? (
                  <>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setView("menu")}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full ${T.softBorder} ${T.softBg} px-3 text-sm font-semibold ${T.muted} hover:opacity-90 transition`}
                        type="button">
                        <I.Cart className="h-5 w-5" />
                        {t.openMenu}
                      </button>

                      <button
                        onClick={demoLogout}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-500/90 px-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        type="button">
                        <I.Logout className="h-5 w-5" />
                        {t.logout}
                      </button>
                    </div>
                  </>
                ) : view === "orderStatus" ? (
                  <>
                    <div className="mt-2">
                      <button
                        onClick={() => setView("menu")}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-500/90 px-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                        type="button">
                        <I.Cart className="h-5 w-5" />
                        {t.backToMenu}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2">
                        <I.Cart className={`h-6 w-6 ${T.muted}`} />

                        {cartCount > 0 ? (
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-500/25 text-[16px] font-semibold leading-none tabular-nums text-blue-900 dark:text-blue-100 relative [top:-0.5px]">
                            {cartCount}
                          </span>
                        ) : (
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full ${T.softBorder} ${T.softBg} text-[13px] font-semibold ${T.faint}`}>
                            0
                          </span>
                        )}
                      </div>

                      <div
                        className={`shrink-0 text-[16px] font-semibold ${T.text}`}>
                        {money(cartTotal)}
                      </div>
                    </div>

                    {(inProgressOrder || readyOrder) &&
                      view !== "order" &&
                      view !== "account" && (
                        <button
                          onClick={() =>
                            openSubmittedOrder(
                              (readyOrder ?? inProgressOrder)?.id,
                            )
                          }
                          className={`mb-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                            readyOrder
                              ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-white hover:from-emerald-400 hover:via-green-400 hover:to-emerald-300 shadow-[0_8px_24px_rgba(16,185,129,0.18)] order-ready-attention"
                              : `${T.softBorder} ${T.softBg} ${T.muted} hover:opacity-90`
                          }`}
                          type="button">
                          {readyOrder ? (
                            <>
                              <I.Check className="h-5 w-5" />
                              {lang === "et"
                                ? "Tellimus valmis"
                                : "Order ready"}
                            </>
                          ) : (
                            <>
                              <I.Receipt className="h-5 w-5" />
                              {lang === "et"
                                ? "Aktiivne tellimus"
                                : "Active order"}
                            </>
                          )}
                        </button>
                      )}

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={view === "order" ? openMenu : openOrder}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full ${T.softBorder} ${T.softBg} px-3 text-sm font-semibold ${T.muted} hover:opacity-90 transition`}
                        type="button">
                        {view === "order" ? (
                          <>
                            <I.Cart className="h-5 w-5" />
                            {t.menu}
                          </>
                        ) : (
                          <>
                            <I.Receipt className="h-5 w-5" />
                            {t.order}
                          </>
                        )}
                      </button>

                      <button
                        onClick={goCheckout}
                        disabled={cartCount === 0}
                        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold text-white transition disabled:opacity-40 ${
                          cartHasAlcohol && !isAgeVerified
                            ? "bg-amber-500 hover:bg-amber-400"
                            : "bg-blue-500/90 hover:bg-blue-500"
                        }`}
                        type="button">
                        {cartHasAlcohol ? (
                          isAgeVerified ? (
                            <>
                              <I.Shield className="h-5 w-5" />
                              {lang === "et" ? "Maksma" : "Checkout"}
                            </>
                          ) : (
                            <>
                              <I.Shield className="h-5 w-5" />
                              {lang === "et" ? "Kinnita vanus" : "Verify age"}
                            </>
                          )
                        ) : (
                          <>
                            <I.Pay className="h-5 w-5" />
                            {lang === "et" ? "Maksmine" : "Checkout"}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientShell>
  );
}
