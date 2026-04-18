import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // All enrollments for the user
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { user_id: userId, status: { not: "cancelled" } },
      select: {
        course_id: true,
        is_completed: true,
        progress_percentage: true,
        course: {
          select: {
            id: true,
            title: true,
            title_ar: true,
            category: true,
            duration_hours: true,
            thumbnail: true,
            lessons: {
              select: { id: true },
              orderBy: { lesson_order: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    const totalEnrolled = enrollments.length;
    const completedEnrollments = enrollments.filter((e) => e.is_completed);
    const totalCompleted = completedEnrollments.length;

    // Average progress across all enrollments
    const avgProgressRaw =
      totalEnrolled > 0
        ? enrollments.reduce((sum, e) => sum + Number(e.progress_percentage), 0) / totalEnrolled
        : 0;
    const avgProgress = Math.round(avgProgressRaw);

    // Total hours: actual completed hours based on progress percentage
    const totalHours = Math.round(
      enrollments.reduce((sum, e) => {
        const progress = Number(e.progress_percentage) / 100;
        return sum + (e.course.duration_hours || 0) * progress;
      }, 0)
    );

    // Continue learning: enrolled courses with their lesson progress
    // Find the most recently accessed lesson per course
    const courseIds = enrollments.map((e) => e.course_id);

    let recentProgress: Array<{ lesson_id: number; lesson: { course_id: number } }> = [];
    if (courseIds.length > 0) {
      recentProgress = await prisma.lessonProgress.findMany({
        where: {
          user_id: userId,
          lesson: { course_id: { in: courseIds } },
        },
        select: {
          lesson_id: true,
          lesson: { select: { course_id: true } },
        },
        orderBy: { created_at: "desc" },
      });
    }

    // For each enrollment, find the last accessed lesson
    const lastLessonByCourse = new Map<number, number>();
    for (const p of recentProgress) {
      if (!lastLessonByCourse.has(p.lesson.course_id)) {
        lastLessonByCourse.set(p.lesson.course_id, p.lesson_id);
      }
    }

    // Completed lesson counts per course
    let completedByCourseCounts: Map<number, number> = new Map();
    if (courseIds.length > 0) {
      const completedRows = await prisma.lessonProgress.groupBy({
        by: ["user_id"],
        where: {
          user_id: userId,
          is_completed: true,
          lesson: { course_id: { in: courseIds } },
        },
        _count: { lesson_id: true },
      });
      // groupBy on nested fields is limited — use a raw approach
      const allCompleted = await prisma.lessonProgress.findMany({
        where: {
          user_id: userId,
          is_completed: true,
          lesson: { course_id: { in: courseIds } },
        },
        select: { lesson: { select: { course_id: true } } },
      });
      for (const row of allCompleted) {
        const cid = row.lesson.course_id;
        completedByCourseCounts.set(cid, (completedByCourseCounts.get(cid) ?? 0) + 1);
      }
    }

    // Total lesson counts per course
    const lessonCounts = await prisma.courseLesson.groupBy({
      by: ["course_id"],
      where: { course_id: { in: courseIds } },
      _count: { id: true },
    });
    const totalLessonsByCourse = new Map(lessonCounts.map((r) => [r.course_id, r._count.id]));

    const continueLearning = enrollments
      .filter((e) => !e.is_completed)
      .map((e) => {
        const courseId = e.course_id;
        const completed = completedByCourseCounts.get(courseId) ?? 0;
        const total = totalLessonsByCourse.get(courseId) ?? 0;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const lastLesson = lastLessonByCourse.get(courseId) ?? e.course.lessons[0]?.id ?? null;
        return {
          courseId,
          title: e.course.title,
          title_ar: e.course.title_ar ?? null,
          category: e.course.category,
          thumbnail: e.course.thumbnail ?? null,
          progress: pct,
          lastLessonId: lastLesson,
        };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    // Recent notifications
    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 5,
      select: { id: true, title: true, message: true, created_at: true, is_read: true, type: true },
    });

    return NextResponse.json({
      totalEnrolled,
      totalCompleted,
      avgProgress,
      totalHours,
      continueLearning,
      notifications: notifications.map((n) => ({
        ...n,
        created_at: n.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
