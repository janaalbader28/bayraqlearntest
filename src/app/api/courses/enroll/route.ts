import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const courseIdRaw = body.courseId;
    const courseId =
      typeof courseIdRaw === "number"
        ? courseIdRaw
        : typeof courseIdRaw === "string"
          ? Number.parseInt(courseIdRaw, 10)
          : Number.NaN;

    if (!Number.isFinite(courseId)) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    try {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          user_id: session.user.id,
          course_id: courseId,
          status: "active",
        },
        select: {
          id: true,
          user_id: true,
          course_id: true,
          status: true,
          enrollment_date: true,
        },
      });
      return NextResponse.json({ ok: true, message: "Enrollment successful", enrollment }, { status: 201 });
    } catch (e: unknown) {
      // Prevent duplicates (unique [user_id, course_id])
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return NextResponse.json({ ok: true, message: "Already enrolled" }, { status: 200 });
      }
      throw e;
    }
  } catch (error: unknown) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
