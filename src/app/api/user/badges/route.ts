import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { BADGE_DEFINITIONS } from "@/lib/badge-definitions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const earned = await prisma.userBadge.findMany({
      where: { user_id: session.user.id },
      select: { badge_key: true, earned_at: true },
    });

    const earnedMap = new Map(earned.map((b) => [b.badge_key, b.earned_at.toISOString()]));

    const badges = BADGE_DEFINITIONS.map((def) => ({
      key: def.key,
      name: def.name,
      name_ar: def.name_ar,
      description: def.description,
      description_ar: def.description_ar,
      icon: def.icon,
      earned: earnedMap.has(def.key),
      earned_at: earnedMap.get(def.key) ?? null,
    }));

    return NextResponse.json({ badges });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
