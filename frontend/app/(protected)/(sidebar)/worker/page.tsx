"use client";

import { useRouter } from "next/navigation";
import { ClipboardList, Gift, Gamepad2 } from "lucide-react";

export default function WorkerDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <button
          onClick={() => router.push("/worker/orders")}
          className="bg-card border rounded-xl p-8 hover:bg-muted transition flex items-center justify-center gap-3"

        >
          <ClipboardList className="w-10 h-10 text-blue-500" />
          <h2 className="text-xl text-gray-100 font-semibold">Tellimused</h2>
        </button>

        <button
          onClick={() => router.push("/worker/promo")}
          className="bg-card border rounded-xl p-8 hover:bg-muted transition flex items-center justify-center gap-3"
        >
          <Gift className="w-10 h-10 text-pink-500" />
          <h2 className="text-xl text-gray-100 font-semibold">Promo</h2>
        </button>

        <button
          onClick={() => router.push("/worker/games")}
          className="bg-card border rounded-xl p-8 hover:bg-muted transition flex items-center justify-center gap-3"
        >
          <Gamepad2 className="w-10 h-10 text-green-500" />
          <h2 className="text-xl text-gray-100 font-semibold">Mängud</h2>
        </button>

      </div>
    </div>
  );
}