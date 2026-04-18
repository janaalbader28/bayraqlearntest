import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CoursePlayerClient, type PlayerModule } from "@/components/course/CoursePlayerClient";

function extractModuleTitle(content: string | null): string | null {
  if (!content) return null;
  const line = content.split("\n").find((l) => l.trim().toLowerCase().startsWith("module:"));
  if (!line) return null;
  const t = line.split(":").slice(1).join(":").trim();
  return t || null;
}

function sumMinutes(items: Array<{ duration_minutes: number }>): number {
  return items.reduce((acc, l) => acc + (Number.isFinite(l.duration_minutes) ? l.duration_minutes : 0), 0);
}

export default async function CoursePlayerPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const resolvedParams = await params;
  const courseId = Number.parseInt(resolvedParams.id, 10);
  const lessonId = Number.parseInt(resolvedParams.lessonId, 10);
  if (!Number.isFinite(courseId) || !Number.isFinite(lessonId)) notFound();

  const session = await getSession();
  if (!session?.user?.id) {
    redirect(`/login?next=/dashboard/courses/${courseId}/learn/${lessonId}`);
  }
  const userId: number = session.user.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { lesson_order: "asc" } },
      quizzes: {
        where: { is_active: true },
        orderBy: { quiz_order: "asc" },
        select: { id: true, title: true, passing_score: true },
      },
    },
  });
  if (!course) notFound();

  // Verify enrollment (unless admin)
  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";
  if (!isAdmin) {
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { user_id: userId, course_id: courseId },
      select: { id: true },
    });
    if (!enrollment) {
      redirect(`/courses/${courseId}`);
    }
  }

  const currentIndex = course.lessons.findIndex((l) => l.id === lessonId);

  // If lessonId not found, redirect to the first lesson
  if (currentIndex === -1) {
    const firstLesson = course.lessons[0];
    if (firstLesson) {
      redirect(`/dashboard/courses/${courseId}/learn/${firstLesson.id}`);
    }
    notFound();
  }

  // Previous: prev lesson, or null if first
  const prevItemUrl =
    currentIndex > 0
      ? `/dashboard/courses/${courseId}/learn/${course.lessons[currentIndex - 1].id}`
      : null;

  // Next: next lesson, or first quiz if on last lesson, or null
  let nextItemUrl: string | null = null;
  if (currentIndex < course.lessons.length - 1) {
    nextItemUrl = `/dashboard/courses/${courseId}/learn/${course.lessons[currentIndex + 1].id}`;
  } else if (course.quizzes.length > 0) {
    nextItemUrl = `/dashboard/courses/${courseId}/quiz/${course.quizzes[0].id}`;
  }

  // Build modules for sidebar
  const lessonModules = new Map<string, Array<(typeof course.lessons)[number]>>();
  for (const lesson of course.lessons) {
    const m = extractModuleTitle(lesson.content) ?? "Introduction";
    lessonModules.set(m, [...(lessonModules.get(m) ?? []), lesson]);
  }

  const modules: PlayerModule[] = [...lessonModules.entries()].map(([title, lessons]) => ({
    title,
    durationMinutes: sumMinutes(lessons),
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      duration_minutes: l.duration_minutes,
      content: l.content,
    })),
  }));

  // Progress — count completed lessons and passed quizzes
  const [progressRows, passedQuizRows] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: {
        user_id: userId,
        lesson_id: { in: course.lessons.map((l) => l.id) },
        is_completed: true,
      },
      select: { lesson_id: true },
    }),
    prisma.quizAttempt.findMany({
      where: { user_id: userId, passed: true, quiz: { course_id: courseId } },
      select: { quiz_id: true },
      distinct: ["quiz_id"],
    }),
  ]);

  const completedLessonIds = progressRows.map((r) => r.lesson_id);
  const passedQuizIds = passedQuizRows.map((r) => r.quiz_id);

  const totalItems = course.lessons.length + course.quizzes.length;
  const progressPct =
    totalItems > 0
      ? Math.round(((completedLessonIds.length + passedQuizIds.length) / totalItems) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <CoursePlayerClient
        courseId={course.id}
        courseTitle={course.title}
        modules={modules}
        quizzes={course.quizzes}
        currentLessonId={lessonId}
        progressPct={progressPct}
        completedLessonIds={completedLessonIds}
        passedQuizIds={passedQuizIds}
        prevItemUrl={prevItemUrl}
        nextItemUrl={nextItemUrl}
      />
    </div>
  );
}
