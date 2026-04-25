"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { backendUrl } from "@/utils/constants";

type Org = {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
};

type User = {
    id: number;
    email?: string;
    needsOnboarding?: boolean;
};

const fetcher = async (url: string) => {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) return null;
    try {
        return await r.json();
    } catch {
        return null;
    }
};

export default function OnboardingPage() {
    const router = useRouter();

    const [orgs, setOrgs] = useState<Org[]>([]);
    const [organizationId, setOrganizationId] = useState<number | "">("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { data: user, isLoading: loadingUser } = useSWR<User>(
        "/api/backend/account",
        fetcher,
        { refreshInterval: 0, revalidateOnFocus: false }
    );

    useEffect(() => {
        if (user && user.needsOnboarding === false) {
            router.replace("/worker/dashboard");
        }
    }, [user, router]);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/backend/organizations/available", {
                    credentials: "include",
                });

                if (!r.ok) {
                    throw new Error("Failed to load organizations");
                }

                const list = await r.json();
                if (Array.isArray(list)) {
                    setOrgs(list);
                }
            } catch (err) {
                console.error("Error loading organizations:", err);
                setError("Failed to load organizations");
            } finally {
                setLoadingOrgs(false);
            }
        })();
    }, []);

    const selectedOrg = useMemo(() => {
        return orgs.find((org) => org.id === organizationId) ?? null;
    }, [orgs, organizationId]);

    useEffect(() => {
        if (orgs.length === 1) {
            setOrganizationId(orgs[0].id);
        } else if (
            organizationId !== "" &&
            !orgs.some((org) => org.id === organizationId)
        ) {
            setOrganizationId("");
        }
    }, [orgs, organizationId]);

    async function submit() {
        try {
            setSaving(true);
            setError(null);

            if (organizationId === "") {
                throw new Error("Please choose an organization");
            }

            if (!selectedOrg) {
                throw new Error("Selected organization is invalid");
            }

            if (!acceptTerms) {
                throw new Error("You must accept the Terms & Privacy Policy");
            }

            const confirmed = window.confirm(
                `Are you sure you want to join "${selectedOrg.name}"?`
            );

            if (!confirmed) {
                return;
            }

            const resp = await fetch("/api/backend/account/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    organizationId,
                    acceptTerms,
                }),
            });

            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`Failed (${resp.status}) ${txt || ""}`.trim());
            }

            router.replace("/worker/dashboard");
        } catch (e: any) {
            setError(e?.message ?? "Failed to save");
        } finally {
            setSaving(false);
        }
    }

    const isInitialLoading = loadingUser || loadingOrgs;
    const hasAvailableOrganizations = orgs.length > 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-lg rounded-2xl bg-card text-card-foreground p-6 shadow [color-scheme:light]">
                <h1 className="text-xl font-semibold">Finish onboarding</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Choose your organization to continue.
                </p>

                <div className="mt-5 space-y-4">
                    {isInitialLoading ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : !user?.email ? (
                        <p className="text-sm text-destructive">
                            Could not determine your email address.
                        </p>
                    ) : !hasAvailableOrganizations ? (
                        <p className="text-sm text-destructive">
                            You do not belong to any organization.
                        </p>
                    ) : (
                        <div>
                            <label className="text-sm font-medium">Organization</label>
                            <select
                                className="mt-1 w-full rounded-lg border border-input bg-background text-foreground px-3 py-2"
                                value={organizationId}
                                onChange={(e) =>
                                    setOrganizationId(e.target.value ? Number(e.target.value) : "")
                                }
                                disabled={saving}
                            >
                                <option value="">Select…</option>
                                {orgs.map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            disabled={saving || !hasAvailableOrganizations}
                        />
                        I accept the Terms &amp; Privacy Policy.
                    </label>

                    {selectedOrg && (
                        <p className="text-sm text-muted-foreground">
                            You will be asked to confirm before joining{" "}
                            <strong>{selectedOrg.name}</strong>.
                        </p>
                    )}

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <a
                        className="rounded-lg border border-input px-4 py-2 text-foreground"
                        href={`${backendUrl}/logout`}
                    >
                        Cancel
                    </a>
                    <button
                        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
                        disabled={
                            saving ||
                            !acceptTerms ||
                            organizationId === "" ||
                            !hasAvailableOrganizations
                        }
                        onClick={submit}
                    >
                        {saving ? "Saving…" : "Finish"}
                    </button>
                </div>
            </div>
        </div>
    );
}