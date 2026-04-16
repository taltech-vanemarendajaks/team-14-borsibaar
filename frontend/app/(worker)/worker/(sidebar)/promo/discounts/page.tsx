"use client";

import { useState } from "react";

type DiscountType = "percent" | "fixed";

type Discount = {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  active: boolean;
  startAt: string;
  endAt: string;
  appliesTo: {
    beer: boolean;
    cocktails: boolean;
    shots: boolean;
    food: boolean;
  };
};

const formatForInput = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDisplay = (value: string) => {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    hour12: false,
  });
};

export default function DiscountsPage() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: "1",
      name: "Student Night",
      type: "percent",
      value: 20,
      active: true,
      startAt: formatForInput(now),
      endAt: formatForInput(tomorrow),
      appliesTo: {
        beer: true,
        cocktails: true,
        shots: false,
        food: false,
      },
    },
  ]);

  const [newName, setNewName] = useState("");
  const [type, setType] = useState<DiscountType>("percent");
  const [value, setValue] = useState(10);
  const [startAt, setStartAt] = useState(formatForInput(now));
  const [endAt, setEndAt] = useState(formatForInput(tomorrow));
  const [editingId, setEditingId] = useState<string | null>(null);

  const [appliesTo, setAppliesTo] = useState({
    beer: true,
    cocktails: true,
    shots: false,
    food: false,
  });

  const toggleCategory = (key: keyof typeof appliesTo) => {
    setAppliesTo((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addDiscounts = () => {
    if (!newName.trim()) return;

    const newDiscounts: Discount = {
      id: Date.now().toString(),
      name: newName,
      type,
      value,
      active: true,
      startAt,
      endAt,
      appliesTo,
    };

    setDiscounts((prev) => [newDiscounts, ...prev]);

    const newNow = new Date();
    const newTomorrow = new Date(
      newNow.getTime() + 24 * 60 * 60 * 1000
    );

    setNewName("");
    setValue(10);
    setType("percent");
    setStartAt(formatForInput(newNow));
    setEndAt(formatForInput(newTomorrow));
  };

  const toggleActive = (id: string) => {
    setDiscounts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );
  };

  const startEdit = (discount: Discount) => {
    setEditingId(discount.id);
    setNewName(discount.name);
    setType(discount.type);
    setValue(discount.value);
    setStartAt(discount.startAt);
    setEndAt(discount.endAt);
    setAppliesTo(discount.appliesTo);
  };

  const saveEdit = () => {
    if (!editingId || !newName.trim()) return;

    setDiscounts((prev) =>
      prev.map((discount) =>
        discount.id === editingId
          ? {
              ...discount,
              name: newName,
              type,
              value,
              startAt,
              endAt,
              appliesTo,
            }
          : discount
      )
    );

    const newNow = new Date();
    const newTomorrow = new Date(
      newNow.getTime() + 24 * 60 * 60 * 1000
    );

    setEditingId(null);
    setNewName("");
    setValue(10);
    setType("percent");
    setStartAt(formatForInput(newNow));
    setEndAt(formatForInput(newTomorrow));
  };

  const cancelEdit = () => {
    const newNow = new Date();
    const newTomorrow = new Date(
      newNow.getTime() + 24 * 60 * 60 * 1000
    );

    setEditingId(null);
    setNewName("");
    setValue(10);
    setType("percent");
    setStartAt(formatForInput(newNow));
    setEndAt(formatForInput(newTomorrow));
  };

  const deleteDiscounts = (id: string) => {
    setDiscounts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center">
      <div className="w-full max-w-3xl">

        <div className="rounded-lg bg-card p-6 shadow-sm border border-[color-mix(in oklab, var(--ring) 50%, transparent)] mb-6">
          <h1 className="text-3xl font-bold text-gray-100">
            Discounts
          </h1>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-sm border border-[color-mix(in oklab, var(--ring) 50%, transparent)] space-y-4 mb-6">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Discount Name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Discount name"
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-transparent text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType("percent")}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  type === "percent"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                %
              </button>

              <button
                onClick={() => setType("fixed")}
                className={`flex-1 py-2 rounded-lg font-medium ${
                  type === "fixed"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                €
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-transparent text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Active time range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-transparent text-gray-100"
              />
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-transparent text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Product categories
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(appliesTo).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() =>
                    toggleCategory(key as keyof typeof appliesTo)
                  }
                  className={`flex-1 p-2 rounded-lg text-sm font-medium transition capitalize ${
                    val
                      ? "bg-green-700 text-green-100"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {editingId ? (
            <div className="flex gap-2">
              <button
                onClick={saveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
              >
                Save changes
              </button>

              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={addDiscounts}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
            >
              Create discount
            </button>
          )}
        </div>

        <div className="space-y-3">
          {discounts.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-gray-700 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg text-gray-100">{c.name}</p>

                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      c.active
                        ? "bg-green-900 text-green-100"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="block text-sm text-gray-300">
                  <p>
                    {c.type === "percent"
                      ? `${c.value}% off`
                      : `-${c.value}€ off`}
                  </p>

                  <p>
                    {Object.entries(c.appliesTo)
                      .filter(([, enabled]) => enabled)
                      .map(([key]) => key)
                      .join(", ")}
                  </p>

                  <p>
                    {`${formatDisplay(c.startAt)} - ${formatDisplay(
                      c.endAt
                    )}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(c)}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleActive(c.id)}
                  className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  {c.active ? "Inactivate" : "Activate"}
                </button>

                <button
                  onClick={() => deleteDiscounts(c.id)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}