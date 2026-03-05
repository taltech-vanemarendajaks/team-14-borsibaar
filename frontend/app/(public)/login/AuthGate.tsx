"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function AuthGate({backendUrl}: { backendUrl: string }) {
    const router = useRouter();

    const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_AUTO_LOGIN === 'true';

    useEffect(() => {
        if (!debugEnabled) return;

        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`${backendUrl}/api/account`, {
                    method: "GET",
                    credentials: "include", // IMPORTANT (cookie)
                });

                if (!cancelled && res.ok) {
                    const me = await res.json();
                    if (me && me.organizationId) {
                        router.replace("/dashboard");
                    } else {
                        router.replace("/onboarding");
                    }
                }
            } catch {
                // backend down etc. -> stay on login
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [backendUrl, router, debugEnabled]);

    return null;
}