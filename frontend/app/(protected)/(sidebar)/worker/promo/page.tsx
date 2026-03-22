"use client";

import { Gift } from "lucide-react";

export default function PromoPage() {

  return (
    <div className="min-h-screen bg-background p-6">

      <div className="flex items-center space-x-2">
        <Gift className="w-10 h-10 text-pink-500" />
        <h2 className="text-xl text-gray-100 font-semibold">Promo</h2>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-gray-300">
          Siia tuleb promotsioonide haldus.
        </p>
      </div>
    </div>
  );
}