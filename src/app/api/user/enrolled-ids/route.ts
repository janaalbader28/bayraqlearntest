import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ ids: [] });
    }
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        user_id: session.user.id,
        status: { in: ["active", "completed"] },
      },
      select: { course_id: true },
    });
    return NextResponse.json({ ids: enrollments.map((e) => e.course_id) });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}
