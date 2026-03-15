"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export default function GamesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background p-6">

      <div className="flex items-center space-x-2">
        <Gamepad2 className="w-10 h-10 text-pink-500" />
        <h2 className="text-xl text-gray-100 font-semibold">Mängud</h2>
      </div>

      <div className="bg-card border rounded-lg p-6 mt-4">
        <p className="text-gray-300">
          Siia tuleb mängude haldus.
        </p>
      </div>
    </div>
  );
}