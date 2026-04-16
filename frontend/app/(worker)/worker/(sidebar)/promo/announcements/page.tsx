"use client";

import { useState } from "react";

type AnnouncementType = "Info" | "Promotion" | "Alert";

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  startAt: string;
  endAt: string;
  active: boolean;
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function AnnouncementsPage() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      title: "Happy Hour Live",
      message: "All beers -20% until 19:00",
      type: "Promotion",
      startAt: formatForInput(now),
      endAt: formatForInput(tomorrow),
      active: true,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AnnouncementType>("Info");
  const [startAt, setStartAt] = useState(formatForInput(now));
  const [endAt, setEndAt] = useState(formatForInput(tomorrow));

  const resetForm = () => {
    const newNow = new Date();
    const newTomorrow = new Date(newNow.getTime() + 24 * 60 * 60 * 1000);

    setTitle("");
    setMessage("");
    setType("Info");
    setStartAt(formatForInput(newNow));
    setEndAt(formatForInput(newTomorrow));
    setEditingId(null);
  };

  const saveAnnouncement = () => {
    if (!title.trim() || !message.trim()) return;

    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title,
                message,
                type,
                startAt,
                endAt,
              }
            : a
        )
      );
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        message,
        type,
        startAt,
        endAt,
        active: true,
      };

      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    }

    resetForm();
  };

  const editAnnouncement = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setType(announcement.type);
    setStartAt(announcement.startAt);
    setEndAt(announcement.endAt);
  };

  const toggleActive = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    if (editingId === id) {
      resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex justify-center">
      <div className="w-full max-w-3xl">

        <div className="rounded-lg bg-card p-6 shadow-sm border border-[color-mix(in oklab, var(--ring) 50%, transparent)] mb-6">
          <h1 className="text-3xl font-bold text-gray-100">
            Announcements
          </h1>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-sm border border-[color-mix(in oklab, var(--ring) 50%, transparent)] space-y-4 mb-6">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Announcement Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-transparent text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Announcement message"
              rows={3}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-transparent text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Active time range *
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {(["Info", "Promotion", "Alert"] as AnnouncementType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 p-2 rounded-lg text-sm font-medium transition ${
                    type === t
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveAnnouncement}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium"
            >
              {editingId ? "Save changes" : "Create announcement"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-card border border-gray-700 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg text-gray-100">{a.title}</p>

                  <span className={`text-xs px-2 py-0.5 rounded ${
                    a.active
                      ? "bg-green-900 text-green-100"
                      : "bg-gray-800 text-gray-400"
                  }`}>
                    {a.active ? "Active" : "Inactive"}
                  </span>

                  <span className="text-xs px-2 py-0.5 rounded bg-pink-900 text-pink-200">
                    {a.type}
                  </span>
                </div>

                <div className="block text-sm text-gray-300">
                  <p>{a.message}</p>

                  <p>
                    {`${formatDisplay(a.startAt)} - ${formatDisplay(a.endAt)}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editAnnouncement(a)}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleActive(a.id)}
                  className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm"
                >
                  {a.active ? "Inactivate" : "Activate"}
                </button>

                <button
                  onClick={() => deleteAnnouncement(a.id)}
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