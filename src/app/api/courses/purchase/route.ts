import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
import { Prisma } from "@prisma/client";
import { awardBadges } from "@/lib/badges";
import { sendPurchaseEmail } from "@/lib/email";
import { logAuditAction } from "@/lib/logger";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admins must not purchase courses
    if (isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "Admins cannot purchase courses" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const courseIdRaw = body.courseId;
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "card";

    const courseId =
      typeof courseIdRaw === "number"
        ? courseIdRaw
        : typeof courseIdRaw === "string"
          ? Number.parseInt(courseIdRaw, 10)
          : Number.NaN;

    if (!Number.isFinite(courseId)) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const [course, existingEnrollment] = await Promise.all([
      prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true, title: true, price: true, duration_hours: true,
          zoom_link: true, schedule_json: true, whatsapp_link: true,
          is_live_course: true, short_description: true, category: true,
        },
      }),
      prisma.courseEnrollment.findFirst({
        where: {
          user_id: session.user.id,
          course_id: courseId,
          status: { in: ["active", "completed"] },
        },
        select: { id: true },
      }),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled", alreadyEnrolled: true },
        { status: 409 }
      );
    }

    // Keep Prisma Decimal for storage, derive a plain number only for display/email
    const priceDecimal = course.price;
    const priceNumber = Number(priceDecimal);

    // Create enrollment (idempotent on duplicate)
    let enrollmentId: number | null = null;
    try {
      const enrollment = await prisma.courseEnrollment.create({
        data: { user_id: session.user.id, course_id: courseId, status: "active" },
        select: { id: true },
      });
      enrollmentId = enrollment.id;

      // Increment course enrollment_count
      await prisma.course.update({
        where: { id: courseId },
        data: { enrollment_count: { increment: 1 } },
      });
    } catch (e: unknown) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // Already enrolled — still record payment
      } else {
        throw e;
      }
    }

    // Record payment — pass Prisma Decimal directly to avoid float precision issues
    await prisma.payment.create({
      data: {
        user_id: session.user.id,
        course_id: courseId,
        amount: priceDecimal,
        currency: "SAR",
        status: "completed",
        payment_method: paymentMethod,
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    });

    // Audit log
    await logAuditAction({ userId: session.user.id, action: "COURSE_PURCHASE", resource: `course:${courseId}`, details: course.title });

    // Non-blocking: notification, badges, email — failures must not roll back the purchase
    prisma.notification.create({
      data: {
        user_id: session.user.id,
        title: "Enrollment Confirmed",
        message: `You have successfully enrolled in "${course.title}". Start learning now!`,
        type: "success",
      },
    }).catch(() => null);

    awardBadges(session.user.id, "enrollment").catch(() => null);

    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, username: true },
    }).then((user) => {
      if (!user) return;
      sendPurchaseEmail({
        to: user.email,
        username: user.username,
        courseTitle: course.title,
        courseDescription: course.short_description ?? null,
        category: course.category,
        isLive: course.is_live_course,
        durationHours: course.duration_hours,
        price: priceNumber,
        zoomLink: course.zoom_link ?? null,
        scheduleJson: course.schedule_json ?? null,
        whatsappLink: course.whatsapp_link ?? null,
      }).catch(() => null);
    }).catch(() => null);

    return NextResponse.json({
      ok: true,
      message: "Purchase successful",
      enrollmentId,
    });
  } catch (error: unknown) {
    console.error("Purchase error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
