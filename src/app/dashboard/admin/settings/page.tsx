import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true, role: true, last_login: true, created_at: true },
  });

  if (!user) redirect("/login");

  return (
    <AdminSettingsClient
      username={user.username}
      email={user.email}
      role={String(user.role)}
      memberSince={user.created_at.toISOString()}
      lastLogin={user.last_login?.toISOString() ?? null}
    />
  );
}
