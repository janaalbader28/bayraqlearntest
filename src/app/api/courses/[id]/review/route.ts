/**
 * POST /api/courses/[id]/review
 *
 * Creates or updates the authenticated user's review for a course.
 * Only allowed once the user has completed the course (progress = 100%).
 * Recalculates and persists course.rating / course.rating_count after each write.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courseId = Number.parseInt((await params).id, 10);
    if (!Number.isFinite(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }
    const comment = typeof body.comment === "string" ? body.comment.trim() || null : null;

    // Verify the user has completed the course before allowing a review
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { user_id: session.user.id, course_id: courseId },
      select: { progress_percentage: true, status: true },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }
    const pct = Number(enrollment.progress_percentage);
    if (pct < 100 && enrollment.status !== "completed") {
      return NextResponse.json({ error: "Complete the course before submitting a review" }, { status: 403 });
    }

    // Upsert the review (one review per user per course)
    await prisma.courseReview.upsert({
      where: { user_id_course_id: { user_id: session.user.id, course_id: courseId } },
      update: { rating, comment, is_approved: true },
      create: { user_id: session.user.id, course_id: courseId, rating, comment, is_approved: true },
    });

    // Recalculate course average rating
    const agg = await prisma.courseReview.aggregate({
      where: { course_id: courseId, is_approved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const avgRating = agg._avg.rating ?? 0;
    const ratingCount = agg._count.rating;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        rating: Math.round(avgRating * 100) / 100,
        rating_count: ratingCount,
      },
    });

    return NextResponse.json({ ok: true, rating, ratingCount });
  } catch (error: unknown) {
    console.error("Review error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
