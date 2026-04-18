"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ChevronRight, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { isAdminRole } from "@/lib/admin";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const numericCourseId = Number.parseInt(courseId, 10);

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("card");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // Admin guard — runs whenever user hydrates from localStorage
  useEffect(() => {
    if (user && isAdminRole(user.role)) {
      router.replace("/dashboard/admin");
    }
  }, [user, router]);

  // Fetch course data exactly once on mount
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        if (!Number.isFinite(numericCourseId)) {
          router.replace("/courses");
          return;
        }
        const res = await fetch(`/api/courses/${courseId}`, { credentials: "include" });
        if (!res.ok) {
          router.replace("/courses");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        // Free course — auto-enroll and redirect to dashboard course page
        if (Number(data.price) === 0) {
          await fetch("/api/courses/purchase", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ courseId: numericCourseId, paymentMethod: "free" }),
            headers: { "Content-Type": "application/json" },
          });
          if (!cancelled) router.replace(`/dashboard/courses/${courseId}`);
          return;
        }
        if (!cancelled) setCourse(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, numericCourseId]);

  const handlePayment = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/courses/purchase", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ courseId: numericCourseId, paymentMethod: method }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Purchase failed");
      router.push("/dashboard/courses");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not confirm purchase. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <Link
          href={`/courses/${courseId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to course
        </Link>
        <h1 className="font-heading text-3xl font-bold text-slate-900">Complete purchase</h1>
        <p className="mt-1 text-sm text-slate-600">Review your order and choose a payment method.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <CreditCard className="h-5 w-5 text-blue-600" /> Payment method
            </h2>
            <div className="space-y-3">
              {[
                { id: "card", label: "Credit / Debit Card" },
                { id: "apple_pay", label: "Apple Pay" },
                { id: "bank", label: "Bank Transfer" },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${
                    method === m.id ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={(e) => setMethod(e.target.value)}
                    className="accent-blue-600"
                  />
                  {m.label}
                </label>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              Your payment information is processed securely. We do not store card details.
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Order summary</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="font-medium text-slate-900">{course.title ?? "Course"}</p>
              <p>{course.category ?? ""}</p>
              <p className="text-xs text-slate-400">{course.duration_hours ?? 0}h · {course.level ?? ""}</p>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Total</span>
                  <span className="text-lg font-bold text-slate-900">
                    {Number(course.price ?? 0).toLocaleString()} SAR
                  </span>
                </div>
              </div>
            </div>
            <button
              disabled={processing}
              onClick={handlePayment}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm Purchase
              <ChevronRight className="h-4 w-4" />
            </button>
            <Link
              href={`/courses/${courseId}`}
              className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
