"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ClipboardList, Check } from "lucide-react";

export const dynamic = "force-dynamic";

type OrderStatus = "TÖÖS" | "TÄIDETUD";

interface Order {
  id: string;
  table: string;
  items: string[];
  total: number;
  status: OrderStatus;
}

export default function BarWorker() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data: Order[] = [
        { id: "Tellimus 001", table: "Laud 1", items: ["Jook 11", "Jook 12"], total: 15.5, status: "TÖÖS" },
        { id: "Tellimus 002", table: "Laud 3", items: ["Jook 21", "Jook 22"], total: 19.0, status: "TÖÖS" },
        { id: "Tellimus 003", table: "Laud 5", items: ["Jook 31", "Jook 32"], total: 11.0, status: "TÖÖS" },
        { id: "Tellimus 004", table: "Laud 2", items: ["Jook 41", "Jook 42"], total: 34.0, status: "TÖÖS" },
        { id: "Tellimus 005", table: "Laud 4", items: ["Jook 51", "Jook 52"], total: 18.5, status: "TÖÖS" },
        { id: "Tellimus 006", table: "Laud 6", items: ["Jook 61", "Jook 62"], total: 16.0, status: "TÖÖS" },
        { id: "Tellimus 007", table: "Laud 7", items: ["Jook 71", "Jook 72"], total: 17.5, status: "TÖÖS" }
      ];

      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tellimuste pärimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markOrderDone = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "TÄIDETUD" } : order
      )
    );
  };

  const openOrders = orders.filter((o) => o.status === "TÖÖS");
  const doneOrders = orders.filter((o) => o.status === "TÄIDETUD");

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-gray-100 mb-2">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen w-full bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-100 mb-2">No orders available</p>
          <p className="text-sm text-gray-400">
            Orders will appear here when customers place them.
          </p>
        </div>
      </div>
    );
  }

  const OrderRow = ({
    order,
    showButton
  }: {
    order: Order;
    showButton?: boolean;
  }) => (
    <div className="flex items-center justify-between bg-card border rounded-lg p-4">
      <div className="flex flex-col">
        <span className="font-semibold text-gray-100">{order.id}</span>
        <span className="text-sm text-gray-400">{order.table}</span>
        <span className="text-sm text-gray-300">{order.items.join(", ")}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">€{order.total}</span>

        {showButton && (
          <button
            onClick={() => markOrderDone(order.id)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-md"
          >
            <Check size={16} />
            Täidetud
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4 w-full space-y-8">

      <div className="flex items-center space-x-2">
        <ClipboardList className="w-10 h-10 text-pink-500" />
        <h2 className="text-xl text-gray-100 font-semibold">Tellimused</h2>
      </div>
      <div>
        <h2 className="text-lg font-medium text-gray-300 mb-4">Töös tellimused</h2>

        <div className="space-y-3">
          {openOrders.map((order) => (
            <OrderRow key={order.id} order={order} showButton />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-300 mb-4">
          Täidetud tellimused
        </h2>

        <div className="space-y-3">
          {doneOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}