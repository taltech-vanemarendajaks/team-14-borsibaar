"use client";

import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "./Chart";
import Image from "next/image";
import { CategoryResponse, InventoryResponse } from "@/app/generated";

function GoogleG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.651 32.657 29.158 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.109 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.36 4.337-17.694 10.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.066 0 9.754-1.944 13.254-5.103l-6.118-5.173C29.087 35.318 26.705 36 24 36c-5.134 0-9.62-3.317-11.286-7.946l-6.52 5.02C9.486 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.06 12.06 0 0 1-4.167 5.724l.003-.002 6.118 5.173C36.823 39.3 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

const money = (n: number) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    n,
  );

const sponsors = [
  { name: "Red Bull", logo: "/redbull.svg" },
  { name: "itük", logo: "/ituk_long_nottu_red.svg" },
  { name: "alecoq", logo: "/alecoq.svg" },
  { name: "insük", logo: "/insyk.png" },
  { name: "anora", logo: "/anora-group-logo-white-CMYK.png" },
];

export default function ClientProductsByCategory() {
  const [cats, setCats] = useState<CategoryResponse[]>([]);
  const [groups, setGroups] = useState<Record<string, InventoryResponse[]>>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [errStatus, setErrStatus] = useState<number | null>(null);

  const intervalRef = useRef<number | null>(null);

  const totalItems = useMemo(
    () => Object.values(groups).reduce((sum, arr) => sum + arr.length, 0),
    [groups],
  );

  const isAuthError = errStatus === 401;

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (isAuthError) return;

      setLoading(true);

      try {
        const organizationId = 2;

        const cRes = await fetch(
          `/api/backend/categories?organizationId=${organizationId}`,
          { cache: "no-store", credentials: "include" },
        );

        if (!cRes.ok) {
          const e: any = new Error(`Categories HTTP ${cRes.status}`);
          e.status = cRes.status;
          throw e;
        }

        const cJson = await cRes.json();
        const categoryList: CategoryResponse[] = Array.isArray(cJson)
          ? cJson
          : (cJson?.items ?? cJson?.content ?? []);

        if (!alive) return;
        setCats(categoryList);

        const fetches = categoryList.map(async (c) => {
          const res = await fetch(
            `/api/backend/inventory?categoryId=${c.id}&organizationId=${organizationId}`,
            { cache: "no-store", credentials: "include" },
          );

          if (!res.ok) {
            const e: any = new Error(
              `Inventory HTTP ${res.status} (cat ${c.id})`,
            );
            e.status = res.status;
            throw e;
          }

          const j = await res.json();
          const arr: InventoryResponse[] = Array.isArray(j)
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
        setErr(null);
        setErrStatus(null);
      } catch (e: any) {
        if (!alive) return;

        setErr(e?.message || "Failed to load products");
        setErrStatus(e?.status ?? null);

        if ((e?.status ?? null) === 401 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    intervalRef.current = window.setInterval(load, 1000 * 15);

    return () => {
      alive = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const LoginCard = () => {
    const publicBackendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

    return (
      <div className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden rounded-[32px]">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-[48px] bg-[radial-gradient(60%_40%_at_50%_30%,rgba(255,255,255,0.06)_0%,rgba(7,10,18,0)_72%)]" />

        <div className="relative z-10 w-full max-w-lg text-center">
          <p className="mt-5 text-base font-semibold tracking-wide text-white/85">
            Logi sisse
          </p>

          <a
            href={`${publicBackendUrl}/oauth2/authorization/google`}
            className="mt-10 block">
            <span className="inline-flex w-full items-center justify-center gap-3 rounded-[99px] bg-white/10 px-8 py-6 text-lg font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.45)] transition hover:bg-white/14 active:scale-[0.985] focus:outline-none focus:ring-2 focus:ring-amber-400/35">
              <GoogleG className="h-5 w-5" />
              Jätka Google kontoga
            </span>
          </a>

          <p className="mt-4 text-sm text-white/45">Google OAuth autentimine</p>

          <div className="mt-10 flex items-center justify-between text-sm text-white/45">
            <span>© {new Date().getFullYear()} Tudengibaar</span>
            <span>v0.1</span>
          </div>
        </div>
      </div>
    );
  };

  const panelClass =
    "rounded-2xl border border-white/[0.06] bg-[#070A12]/95 backdrop-blur-md shadow-[0_18px_70px_rgba(0,0,0,0.6)]";

  return (
    <main className="relative h-screen overflow-hidden bg-[#070A12] text-white">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#070A12]" />
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-y-0 left-[-220px] right-0 blur-[12px] bg-[linear-gradient(90deg,rgba(7,10,18,0)_0%,rgba(7,10,18,0.18)_20%,rgba(7,10,18,0.55)_45%,rgba(7,10,18,0.90)_75%,rgba(7,10,18,1)_100%)]" />
      </div>

      <div className="relative z-10 h-full min-h-0 w-full px-4 py-4 flex flex-col gap-4">
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:items-stretch gap-4">
          {isAuthError
            ? null
            : err && (
                <div className="rounded-xl border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                  {err}
                </div>
              )}

          <section
            className={`${panelClass} p-4 flex flex-col lg:flex-[2_1_0%] min-w-0 min-h-0 overflow-hidden`}>
            <div className="mb-3 flex items-center justify-between shrink-0">
              <h2 className="text-lg md:text-xl font-semibold tracking-wide text-white/90">
                Products by Category
              </h2>
              <span className="text-[11px] text-white/45">
                {loading ? "Updating…" : "Live"}
              </span>
            </div>

            {isAuthError ? (
              <LoginCard />
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {loading && !totalItems && (
                    <div className="flex h-40 items-center justify-center text-lg text-white/55">
                      Loading…
                    </div>
                  )}

                  {cats
                    .filter((c) => groups[c.name]?.length)
                    .map((c) => {
                      const items = groups[c.name];

                      return (
                        <div
                          key={c.id}
                          className="inline-block w-full align-top rounded-2xl bg-white/[0.03] border border-white/[0.08] p-3 break-inside-avoid [&:not(:first-child)]:mt-4">
                          <div className="mb-2 flex items-center justify-between break-inside-avoid">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-amber-300/80 to-amber-500/80" />
                              <h3 className="text-xs lg:text-sm font-semibold tracking-[0.18em] text-white/85 uppercase">
                                {c.name}
                              </h3>
                            </div>
                            <span className="text-xs text-white/45">
                              {items.length} items
                            </span>
                          </div>

                          <table className="w-full text-xs lg:text-sm border-separate border-spacing-y-1 break-before-avoid">
                            <thead className="break-after-avoid">
                              <tr className="text-[9px] lg:text-[10px] xl:text-[12px] uppercase tracking-[0.16em] text-white/45">
                                <th className="px-2 py-1 text-left">Product</th>
                                <th className="px-2 py-1 text-right">Price</th>
                                <th className="px-2 py-1 text-right">Δ%</th>
                                <th className="px-2 py-1 text-right">Base</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items
                                .slice()
                                .sort((a, b) =>
                                  a.productName.localeCompare(b.productName),
                                )
                                .map((p) => {
                                  const diff = p.unitPrice - p.basePrice;
                                  const diffPct =
                                    p.basePrice !== 0
                                      ? (diff / p.basePrice) * 100
                                      : 0;

                                  const isUp = diff > 0;
                                  const isDown = diff < 0;

                                  return (
                                    <tr
                                      key={p.productId}
                                      className="bg-white/[0.03] hover:bg-white/[0.06] transition-colors break-inside-avoid rounded-xl">
                                      <td className="px-2 py-2">
                                        <span className="font-medium truncate block text-[16px] text-white/90">
                                          {p.productName}
                                        </span>
                                        <p className="text-white/55">
                                          {p.description}
                                        </p>
                                      </td>

                                      <td className="px-2 py-2 text-right tabular-nums text-white/85">
                                        {money(p.unitPrice)}
                                      </td>

                                      <td
                                        className={clsx(
                                          "px-2 py-2 text-right tabular-nums font-semibold whitespace-nowrap",
                                          isUp && "text-emerald-400",
                                          isDown && "text-red-400",
                                          !isUp && !isDown && "text-white/45",
                                        )}>
                                        {diff === 0 ? (
                                          "—"
                                        ) : (
                                          <>
                                            {diff > 0 ? "▲" : "▼"}{" "}
                                            {Math.abs(diffPct).toFixed(1)}%
                                          </>
                                        )}
                                      </td>

                                      <td className="px-2 py-2 text-right tabular-nums text-white/70">
                                        {money(p.basePrice)}
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}

                  {!totalItems && !loading && (
                    <div className="flex h-40 items-center justify-center text-lg text-white/55">
                      No products to display
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section
            className={`${panelClass} p-4 flex flex-col lg:flex-[1_1_0%] min-w-0 min-h-0 overflow-hidden`}>
            <header className="shrink-0 flex flex-col gap-2 text-center justify-between pb-4">
              <div className="max-h-[130px] w-full flex justify-center">
                <img
                  src="/tudengibaarlogo.png"
                  alt="Tudengibaar"
                  className="h-full object-contain opacity-95"
                />
              </div>
              <p className="text-xs font-semibold tracking-wide text-white/55">
                Live pricing dashboard
              </p>
            </header>

            <div className="shrink-0 mb-3 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold tracking-wide text-white/90">
                Price History
              </h2>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <Chart groups={groups} />
            </div>

            <div className="shrink-0 inline-flex items-center gap-5 rounded-full bg-white/[0.03] px-6 py-4 mx-3 my-2 border border-white/[0.08]">
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-white/45">
                Sponsored by
              </span>

              {sponsors.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-center h-10 w-30 md:w-32">
                  <Image
                    src={s.logo}
                    alt={s.name}
                    width={120}
                    height={40}
                    className="max-h-10 max-w-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="hidden" />
      </div>
    </main>
  );
}
