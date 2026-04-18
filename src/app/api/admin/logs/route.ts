import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const actionRaw = body.action;
    const resourceRaw = body.resource;
    const detailsRaw = body.details;

    if (typeof actionRaw !== "string" || !actionRaw.trim()) {
      return NextResponse.json({ error: "Missing required field: action" }, { status: 400 });
    }

    const action = actionRaw.trim();
    const resource = typeof resourceRaw === "string" && resourceRaw.trim() ? resourceRaw.trim() : null;
    const details = typeof detailsRaw === "string" && detailsRaw.trim() ? detailsRaw.trim() : null;
    const ip_address = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined;

    const created = await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        action,
        resource,
        details,
        ip_address,
      },
      select: {
        id: true,
        created_at: true,
        action: true,
        resource: true,
        details: true,
      },
    });

    return NextResponse.json({ ok: true, log: created }, { status: 201 });
  } catch (error: unknown) {
    console.error("Admin add log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

