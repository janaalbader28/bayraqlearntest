import prisma from "@/lib/prisma";
import { AdminLogsClient } from "@/components/admin/AdminLogsClient";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  let logs: Array<{
    id: number;
    action: string;
    resource: string | null;
    details: string | null;
    created_at: Date;
    user: { username: string } | null;
  }> = [];

  try {
    logs = await prisma.auditLog.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
      include: { user: { select: { username: true } } },
    });
  } catch {
    logs = [];
  }

  return (
    <AdminLogsClient
      logs={logs.map((l) => ({
        id: l.id,
        action: l.action,
        resource: l.resource,
        details: l.details,
        created_at: l.created_at.toISOString(),
        username: l.user?.username ?? null,
      }))}
    />
  );
}
