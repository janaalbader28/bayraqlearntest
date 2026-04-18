import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.notification.findMany({
    where: { user_id: session.user.id },
    orderBy: { created_at: "desc" },
    take: 25,
  });

  if (rows.length === 0) {
    return NextResponse.json({
      items: [
        {
          id: 0,
          title: "Welcome to BayraqLearn",
          message: "Explore courses and track your progress from the dashboard.",
          created_at: new Date().toISOString(),
          is_read: true,
        },
      ],
    });
  }

  return NextResponse.json({
    items: rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      created_at: n.created_at.toISOString(),
      is_read: n.is_read,
    })),
  });
}
