"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";

export function AdminAddLogModal() {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          resource: resource || null,
          details: details || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to add log");
      }

      setOpen(false);
      // Easiest way to refresh server-rendered logs list.
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add log");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
      >
        <Plus className="h-4 w-4" />
        Add log
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">Add custom log</h2>
                <p className="mt-1 text-sm text-slate-600">Record an admin action in the audit log.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Action *</label>
                <input
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  placeholder="e.g. COURSE_STATUS_UPDATE"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Resource (optional)</label>
                <input
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  placeholder="e.g. course:12"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Details (optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
                  placeholder="Any extra information for the audit trail."
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save log
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

