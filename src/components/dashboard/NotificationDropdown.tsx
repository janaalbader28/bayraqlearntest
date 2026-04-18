"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

type Notif = { id: number; title: string; message: string | null; created_at: string; is_read: boolean };

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    setLoading(true);
    fetch("/api/user/notifications")
      .then((r) => r.json())
      .then((d) => {
        if (!ignore && Array.isArray(d.items)) setItems(d.items);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [open]);

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-700"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        ) : null}
      </button>

      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-80 max-h-[min(70vh,420px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          role="menu"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <p className="text-xs text-slate-500">Stay updated on courses and activity</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">You&apos;re all caught up.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => (
                  <li key={n.id} className={`px-4 py-3 ${n.is_read ? "bg-white" : "bg-blue-50/50"}`}>
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    {n.message ? <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{n.message}</p> : null}
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
