import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { QuizPlayerClient } from "@/components/course/QuizPlayerClient";
import type { PlayerModule } from "@/components/course/CoursePlayerClient";

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

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const resolvedParams = await params;
  const courseId = Number.parseInt(resolvedParams.id, 10);
  const quizId = Number.parseInt(resolvedParams.quizId, 10);
  if (!Number.isFinite(courseId) || !Number.isFinite(quizId)) notFound();

  const session = await getSession();
  if (!session?.user?.id) {
    redirect(`/login?next=/dashboard/courses/${courseId}/quiz/${quizId}`);
  }
  const userId: number = session.user.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { lesson_order: "asc" } },
      quizzes: {
        where: { is_active: true },
        orderBy: { quiz_order: "asc" },
        include: {
          questions: {
            orderBy: { question_order: "asc" },
            include: { answers: { orderBy: { id: "asc" } } },
          },
        },
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
    if (!enrollment) redirect(`/courses/${courseId}`);
  }

  const quiz = course.quizzes.find((q) => q.id === quizId);
  if (!quiz) notFound();

  const quizIndex = course.quizzes.findIndex((q) => q.id === quizId);
  const lastLesson = course.lessons[course.lessons.length - 1];

  // Navigation
  const prevItemUrl =
    quizIndex === 0
      ? lastLesson
        ? `/dashboard/courses/${courseId}/learn/${lastLesson.id}`
        : null
      : `/dashboard/courses/${courseId}/quiz/${course.quizzes[quizIndex - 1].id}`;

  const nextItemUrl =
    quizIndex < course.quizzes.length - 1
      ? `/dashboard/courses/${courseId}/quiz/${course.quizzes[quizIndex + 1].id}`
      : null;

  // Build modules for sidebar (same logic as lesson page)
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

  // Progress
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
  const allLessonsDone =
    course.lessons.length === 0 || completedLessonIds.length === course.lessons.length;

  const totalItems = course.lessons.length + course.quizzes.length;
  const progressPct =
    totalItems > 0
      ? Math.round(((completedLessonIds.length + passedQuizIds.length) / totalItems) * 100)
      : 0;

  // Omit is_correct from answers — correct answers revealed only after submission
  const quizData = {
    id: quiz.id,
    title: quiz.title,
    passing_score: quiz.passing_score,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      answers: q.answers.map((a) => ({ id: a.id, answer_text: a.answer_text })),
    })),
  };

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <QuizPlayerClient
        courseId={courseId}
        courseTitle={course.title}
        modules={modules}
        quizzes={course.quizzes.map((q) => ({ id: q.id, title: q.title, passing_score: q.passing_score }))}
        currentQuizId={quizId}
        progressPct={progressPct}
        completedLessonIds={completedLessonIds}
        passedQuizIds={passedQuizIds}
        allLessonsDone={allLessonsDone}
        quiz={quizData}
        prevItemUrl={prevItemUrl}
        nextItemUrl={nextItemUrl}
      />
    </div>
  );
}
