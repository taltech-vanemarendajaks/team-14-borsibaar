"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ClipboardList, LoaderCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type OrderState =
  | "ORDER_CONFIRMED"
  | "IN_MAKING"
  | "READY_FOR_PICKUP"
  | "ORDER_COMPLETE";

interface Order {
  id: number;
  desk?: string;
  clientName?: string;
  products?: OrderProduct[];
  sessionId: string;
  total: number;
  state: OrderState;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
}

interface CurrentWorker {
  id?: string;
  name?: string;
}

interface OrderProduct {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

const ORDER_STATE_ORDER: OrderState[] = [
  "ORDER_CONFIRMED",
  "IN_MAKING",
  "READY_FOR_PICKUP",
  "ORDER_COMPLETE",
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("et-EE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDateTime(value?: string) {
  if (!value) return "Unknown time";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat("et-EE", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("hour")}:${getPart("minute")}, ${getPart("day")}.${getPart(
    "month"
  )}.${getPart("year")}`;
}

function getWorkerDisplayName(order: Order) {
  return order.assignedWorkerName || "Unassigned";
}

function isCurrentWorkersOrder(order: Order, currentWorker: CurrentWorker | null) {
  if (!currentWorker) return false;

  if (order.assignedWorkerId && currentWorker.id) {
    return order.assignedWorkerId === currentWorker.id;
  }

  if (order.assignedWorkerName && currentWorker.name) {
    return order.assignedWorkerName === currentWorker.name;
  }

  return false;
}

function getStatusLabel(state: OrderState) {
  switch (state) {
    case "ORDER_CONFIRMED":
      return "Confirmed";
    case "IN_MAKING":
      return "In making";
    case "READY_FOR_PICKUP":
      return "Ready for pickup";
    case "ORDER_COMPLETE":
      return "Completed";
    default:
      return state;
  }
}

function getActionForState(
  state: OrderState
): { label: string; nextState: OrderState } | null {
  switch (state) {
    case "ORDER_CONFIRMED":
      return { label: "Start preparing", nextState: "IN_MAKING" };
    case "IN_MAKING":
      return { label: "Ready for pickup", nextState: "READY_FOR_PICKUP" };
    case "READY_FOR_PICKUP":
      return { label: "Complete order", nextState: "ORDER_COMPLETE" };
    case "ORDER_COMPLETE":
      return null;
    default:
      return null;
  }
}

function getStateClasses(state: OrderState) {
  switch (state) {
    case "ORDER_CONFIRMED":
      return {
        card: "border-slate-200/40 bg-slate-100/10",
        badge: "border-slate-200/50 bg-slate-100/15 text-slate-100",
      };
    case "IN_MAKING":
      return {
        card: "border-blue-500/35 bg-blue-600/15",
        badge: "border-blue-400/45 bg-blue-500/20 text-blue-100",
      };
    case "READY_FOR_PICKUP":
      return {
        card: "border-green-500/35 bg-green-600/15",
        badge: "border-green-400/45 bg-green-500/20 text-green-100",
      };
    case "ORDER_COMPLETE":
      return {
        card: "border-gray-400/30 bg-gray-500/10",
        badge: "border-gray-300/40 bg-gray-400/15 text-gray-100",
      };
    default:
      return {
        card: "border-border bg-card",
        badge: "border-border bg-muted text-foreground",
      };
  }
}

function OrderCard({
  order,
  currentWorker,
  updatingOrderId,
  updateOrderState,
}: {
  order: Order;
  currentWorker: CurrentWorker | null;
  updatingOrderId: number | null;
  updateOrderState: (orderId: number, nextState: OrderState) => Promise<void>;
}) {
  const action = getActionForState(order.state);
  const isUpdating = updatingOrderId === order.id;
  const stateClasses = getStateClasses(order.state);
  const isMine = isCurrentWorkersOrder(order, currentWorker);
  const workerClasses = isMine
    ? "border-amber-300/50 bg-amber-300/15 text-amber-100 font-semibold"
    : "border-border bg-black/10 text-gray-300";

  return (
    <div
      key={order.id}
      className={`rounded-lg border p-4 transition-colors ${stateClasses.card}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-gray-100">Order nr {order.id}</span>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide ${stateClasses.badge}`}
            >
              {getStatusLabel(order.state)}
            </span>
            <span
              className={`inline-flex rounded-md border px-2.5 py-1 text-sm transition-colors ${workerClasses}`}
            >
              {getWorkerDisplayName(order)}
            </span>
          </div>

          <div className="grid gap-1 text-sm text-gray-300">
            <span>Desk: {order.desk || "Unknown desk"}</span>
            <span>Client: {order.clientName || "Unknown client"}</span>
            <span>Created: {formatDateTime(order.createdAt)}</span>
          </div>

          <div className="space-y-2 pt-3">
            <div className="inline-grid w-fit grid-cols-[max-content_max-content_max-content] gap-x-4 gap-y-1">
              {(order.products || []).map((product) => (
                <div
                  key={product.id ?? `${order.id}-${product.productId}`}
                  className="contents text-sm text-gray-200"
                >
                  <span>{product.productName}</span>
                  <span>{product.quantity} pcs</span>
                  <span>{formatCurrency(product.unitPrice)}</span>
                </div>
              ))}

              {!order.products?.length && (
                <div className="text-sm text-gray-400">
                  No products
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <span className="text-sm font-medium text-gray-100">
            {formatCurrency(order.total)}
          </span>

          {action && (
            <button
              onClick={() => updateOrderState(order.id, action.nextState)}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : null}
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderSection({
  title,
  emptyMessage,
  orders,
  currentWorker,
  updatingOrderId,
  updateOrderState,
}: {
  title: string;
  emptyMessage: string;
  orders: Order[];
  currentWorker: CurrentWorker | null;
  updatingOrderId: number | null;
  updateOrderState: (orderId: number, nextState: OrderState) => Promise<void>;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-gray-100">{title}</h2>
          <p className="text-sm text-gray-400">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-700 p-4 text-sm text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              currentWorker={currentWorker}
              updatingOrderId={updatingOrderId}
              updateOrderState={updateOrderState}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentWorker, setCurrentWorker] = useState<CurrentWorker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const sortedOrders = [...orders].sort((a, b) => {
    const stateOrder =
      ORDER_STATE_ORDER.indexOf(a.state) - ORDER_STATE_ORDER.indexOf(b.state);

    if (stateOrder !== 0) {
      return stateOrder;
    }

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return bTime - aTime;
  });
  const unassignedOrders = sortedOrders.filter(
    (order) => order.state === "ORDER_CONFIRMED"
  );
  const inProgressOrders = sortedOrders.filter(
    (order) =>
      order.state === "IN_MAKING" || order.state === "READY_FOR_PICKUP"
  );
  const completedOrders = sortedOrders.filter(
    (order) => order.state === "ORDER_COMPLETE"
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [ordersResponse, workerResponse] = await Promise.all([
          fetch("/api/backend/orders", {
            cache: "no-store",
          }),
          fetch("/api/backend/account", {
            cache: "no-store",
          }),
        ]);

        if (!ordersResponse.ok) {
          if (ordersResponse.status === 404) {
            throw new Error("Orders API is not available yet.");
          }

          const message = await ordersResponse.text();
          throw new Error(message || "Failed to fetch orders");
        }

        const data = await ordersResponse.json();
        setOrders(Array.isArray(data) ? data : []);

        if (workerResponse.ok) {
          const workerData = await workerResponse.json();
          setCurrentWorker({
            id:
              typeof workerData?.id === "string" ? workerData.id : undefined,
            name:
              typeof workerData?.name === "string" ? workerData.name : undefined,
          });
        } else {
          setCurrentWorker(null);
        }

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderState = async (orderId: number, nextState: OrderState) => {
    try {
      setUpdatingOrderId(orderId);
      setActionError(null);
      const currentOrder = orders.find((order) => order.id === orderId);

      if (!currentOrder) {
        throw new Error("Order not found in current view");
      }

      const response = await fetch(`/api/backend/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: nextState,
          assignedWorkerId: currentOrder.assignedWorkerId,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update order state");
      }

      const updatedOrder = (await response.json()) as Order;
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update order state"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
          <p className="text-xl text-gray-100 mb-2">No orders found</p>
          <p className="text-sm text-gray-400">
            Orders will appear here when customers submit them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 w-full space-y-8">
      <div className="flex items-center space-x-2">
        <ClipboardList className="w-10 h-10 text-pink-500" />
        <h2 className="text-xl text-gray-100 font-semibold">Orders</h2>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {actionError}
        </div>
      )}

      <OrderSection
        title="Unassigned"
        emptyMessage="No unassigned orders right now."
        orders={unassignedOrders}
        currentWorker={currentWorker}
        updatingOrderId={updatingOrderId}
        updateOrderState={updateOrderState}
      />

      <OrderSection
        title="In progress"
        emptyMessage="No orders are currently in progress."
        orders={inProgressOrders}
        currentWorker={currentWorker}
        updatingOrderId={updatingOrderId}
        updateOrderState={updateOrderState}
      />

      <OrderSection
        title="Completed"
        emptyMessage="No completed orders yet."
        orders={completedOrders}
        currentWorker={currentWorker}
        updatingOrderId={updatingOrderId}
        updateOrderState={updateOrderState}
      />
    </div>
  );
}
