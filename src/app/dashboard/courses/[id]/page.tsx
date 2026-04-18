import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { DashboardCourseClient } from "@/components/dashboard/DashboardCourseClient";

type ModuleSummary = {
  title: string;
  lessonCount: number;
  durationMinutes: number;
  hasQuiz: boolean;
};

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

export default async function CourseOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = Number.parseInt(resolvedParams.id, 10);
  if (!Number.isFinite(courseId)) notFound();

  await getSession();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { lesson_order: "asc" } },
      quizzes: true,
    },
  });
  if (!course) notFound();

  const firstLessonId = course.lessons[0]?.id ?? null;

  const lessonModules = new Map<string, Array<(typeof course.lessons)[number]>>();
  for (const lesson of course.lessons) {
    const m = extractModuleTitle(lesson.content) ?? "Introduction";
    lessonModules.set(m, [...(lessonModules.get(m) ?? []), lesson]);
  }

  const moduleSummaries: ModuleSummary[] = [...lessonModules.entries()].map(([title, lessons]) => {
    const durationMinutes = sumMinutes(lessons);
    const hasQuiz = course.quizzes.some((q) =>
      (q.description ?? "").toLowerCase().includes(`module: ${title}`.toLowerCase())
    );
    return { title, lessonCount: lessons.length, durationMinutes, hasQuiz };
  });

  const totalMinutes = course.lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

  return (
    <DashboardCourseClient
      courseId={course.id}
      title={course.title}
      title_ar={course.title_ar ?? null}
      short_description={course.short_description ?? null}
      description={course.description ?? null}
      status={String(course.status)}
      thumbnail={course.thumbnail ?? null}
      totalMinutes={totalMinutes}
      lessonCount={course.lessons.length}
      quizCount={course.quizzes.length}
      moduleSummaries={moduleSummaries}
      firstLessonId={firstLessonId}
    />
  );
}
