import prisma from "@/lib/prisma";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [users, totalUsers, newUsersThisMonth] = await Promise.all([
    prisma.user.findMany({
      orderBy: { created_at: "desc" },
      take: 200,
      select: { id: true, username: true, email: true, role: true, created_at: true },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { created_at: { gte: startOfMonth } } }),
  ]);

  return (
    <AdminUsersClient
      users={users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: String(u.role),
        created_at: u.created_at.toISOString(),
      }))}
      totalUsers={totalUsers}
      newUsersThisMonth={newUsersThisMonth}
    />
  );
}
