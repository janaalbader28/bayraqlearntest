"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, Pencil, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLanguage } from "@/contexts/LanguageContext";

type MeUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  nickname: string | null;
  phone_number: string | null;
  specialization: string | null;
  bio: string | null;
  country: string | null;
  date_of_birth: string | null;
  profile_image: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const logoutStore = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const { t, lang, isRTL } = useLanguage();
  const sp = t.settingsPage;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [account, setAccount] = useState<{ id: number; username: string; email: string; role: string; created_at: string } | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form, setForm] = useState({
    nickname: "",
    phone_number: "",
    specialization: "",
    bio: "",
    country: "",
    date_of_birth: "",
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load profile");
        if (ignore) return;
        const u = data.user as MeUser;
        setAccount({ id: u.id, username: u.username, email: u.email, role: u.role, created_at: u.created_at });
        setProfileImage(u.profile_image);
        setForm({
          nickname: u.nickname ?? "",
          phone_number: u.phone_number ?? "",
          specialization: u.specialization ?? "",
          bio: u.bio ?? "",
          country: u.country ?? "",
          date_of_birth: u.date_of_birth ? u.date_of_birth.slice(0, 10) : "",
        });
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const memberSince = account?.created_at
    ? new Date(account.created_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { dateStyle: "medium" })
    : "—";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: form.nickname || null,
          phone_number: form.phone_number || null,
          specialization: form.specialization || null,
          bio: form.bio || null,
          country: form.country || null,
          date_of_birth: form.date_of_birth || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const u = data.user as MeUser;
      setUser({ id: u.id, username: u.username, email: u.email, role: u.role });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) { e.target.value = ""; return; }
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/avatar", { method: "POST", credentials: "include", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProfileImage(data.profile_image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const confirmDelete = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/me", { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      logoutStore();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">{sp.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{sp.subtitle}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {/* Profile header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <label
              className={["group relative cursor-pointer overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm transition", editing ? "hover:border-blue-200" : "cursor-default"].join(" ")}
            >
              <div className="relative h-24 w-24">
                {profileImage ? (
                  <Image src={profileImage} alt="Profile" fill className="object-cover" sizes="96px" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xs font-semibold text-slate-400">{sp.noPhoto}</span>
                  </div>
                )}
                {editing ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-900/35 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {avatarUploading ? sp.uploading : sp.change}
                  </div>
                ) : null}
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatar} disabled={!editing} />
              </div>
            </label>

            <div className="mt-4 flex items-center gap-2">
              <div className="text-xl font-bold text-slate-900">{account?.username ?? "—"}</div>
              <button
                type="button"
                onClick={() => setEditing((e) => !e)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {sp.memberSince} <span className="font-medium text-slate-700">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500">{sp.emailLabel}</label>
              <input value={account?.email ?? ""} readOnly className="mt-1 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-500">{sp.displayName}</label>
              <input value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} disabled={!editing} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-70" placeholder={sp.displayNamePlaceholder} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">{sp.phone}</label>
              <input value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} disabled={!editing} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-70" placeholder={sp.phonePlaceholder} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">{sp.country}</label>
              <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} disabled={!editing} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-70" placeholder={sp.countryPlaceholder} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">{sp.dateOfBirth}</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} disabled={!editing} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-70" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">{sp.specialization}</label>
            <input value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))} disabled={!editing} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-70" placeholder={sp.specializationPlaceholder} />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">{sp.bio}</label>
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={4} disabled={!editing} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-70" placeholder={sp.bioPlaceholder} />
          </div>

          <div className={`flex pt-2 ${isRTL ? "justify-start" : "justify-end"}`}>
            <button type="submit" disabled={saving || !editing} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {sp.saveChanges}
            </button>
          </div>
        </div>
      </form>

      <div className={`mt-8 flex border-t border-slate-200 pt-8 ${isRTL ? "justify-end" : "justify-start"}`}>
        <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
          {sp.deleteAccount}
        </button>
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" dir={isRTL ? "rtl" : "ltr"}>
            <p className="font-heading text-lg font-bold text-slate-900">{sp.deleteTitle}</p>
            <p className="mt-2 text-sm text-slate-600">{sp.deleteConfirm}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {lang === "ar" ? "لا" : "No"}
              </button>
              <button type="button" disabled={saving} onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {lang === "ar" ? "نعم" : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
