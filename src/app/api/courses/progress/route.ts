import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, isCompleted } = await request.json();
    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });
    }

    const numericLessonId = Number.parseInt(String(lessonId), 10);
    if (!Number.isFinite(numericLessonId)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: { user_id_lesson_id: { user_id: session.user.id, lesson_id: numericLessonId } },
      update: {
        is_completed: Boolean(isCompleted),
        completed_at: isCompleted ? new Date() : null,
      },
      create: {
        user_id: session.user.id,
        lesson_id: numericLessonId,
        is_completed: Boolean(isCompleted),
        completed_at: isCompleted ? new Date() : null,
      },
    });

    // Recalculate and persist progress_percentage on the enrollment
    const lesson = await prisma.courseLesson.findUnique({
      where: { id: numericLessonId },
      select: { course_id: true },
    });
    let progressPct = 0;
    let isCourseComplete = false;

    if (lesson) {
      const courseId = lesson.course_id;
      const [totalLessons, completedLessons, totalQuizzes, passedAttempts] = await Promise.all([
        prisma.courseLesson.count({ where: { course_id: courseId } }),
        prisma.lessonProgress.count({
          where: { user_id: session.user.id, is_completed: true, lesson: { course_id: courseId } },
        }),
        prisma.courseQuiz.count({ where: { course_id: courseId, is_active: true } }),
        prisma.quizAttempt.findMany({
          where: { user_id: session.user.id, passed: true, quiz: { course_id: courseId } },
          select: { quiz_id: true },
          distinct: ["quiz_id"],
        }),
      ]);
      const passedQuizCount = passedAttempts.length;
      const total = totalLessons + totalQuizzes;
      progressPct = total > 0 ? Math.round(((completedLessons + passedQuizCount) / total) * 100) : 0;
      // Course is complete only when ALL lessons AND ALL quizzes are done
      isCourseComplete = completedLessons === totalLessons && passedQuizCount === totalQuizzes;

      const enrollmentData: Record<string, unknown> = { progress_percentage: progressPct };
      if (isCourseComplete) {
        enrollmentData.status = "completed";
        enrollmentData.is_completed = true;
        enrollmentData.completion_date = new Date();
      }

      await prisma.courseEnrollment.updateMany({
        where: { user_id: session.user.id, course_id: courseId },
        data: enrollmentData,
      });
    }

    return NextResponse.json({
      message: "Progress updated successfully",
      progress,
      progressPct,
      isCourseComplete,
    });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
