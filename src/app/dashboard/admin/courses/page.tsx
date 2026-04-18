import prisma from "@/lib/prisma";
import { AdminCoursesListClient } from "@/components/admin/AdminCoursesListClient";

export default async function AdminCoursesPage() {
  const [courses, totalCourses, openCourses, mostEnrolled] = await Promise.all([
    prisma.course.findMany({ orderBy: { created_at: "desc" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "published" } }),
    prisma.course.findFirst({
      orderBy: { enrollment_count: "desc" },
      select: { title: true, enrollment_count: true },
    }),
  ]);

  return (
    <AdminCoursesListClient
      courses={courses.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        level: String(c.level),
        status: String(c.status),
        is_live_course: c.is_live_course,
      }))}
      totalCourses={totalCourses}
      openCourses={openCourses}
      mostEnrolledTitle={mostEnrolled?.title ?? null}
      mostEnrolledCount={mostEnrolled?.enrollment_count ?? 0}
    />
  );
}
