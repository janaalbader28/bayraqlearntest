import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { HomeNav } from "@/components/marketing/HomeNav";
import { CourseDetailClient } from "@/components/course/CourseDetailClient";

export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) notFound();

  const session = await getSession();
  const course = await prisma.course.findFirst({
    where: { id, status: "published" },
    include: { quizzes: true },
  });

  if (!course) notFound();

  if (session?.user?.id) {
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: { course_id: id, user_id: session.user.id },
      select: { id: true },
    });
    if (enrollment) redirect(`/dashboard/courses/${id}`);
  }

  const price = Number(course.price);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HomeNav />
      <CourseDetailClient
        id={course.id}
        title={course.title}
        title_ar={course.title_ar ?? null}
        short_description={course.short_description ?? null}
        description={course.description ?? null}
        category={course.category}
        level={course.level ?? null}
        status={course.status}
        duration_hours={course.duration_hours}
        rating={Number(course.rating)}
        enrollment_count={course.enrollment_count}
        price={price}
        thumbnail={course.thumbnail ?? null}
        isFree={price === 0}
        isLoggedIn={!!session?.user?.id}
        loginHref={`/login?next=${encodeURIComponent(`/courses/${id}`)}`}
        actionHref={price === 0 ? `/dashboard/courses/${id}` : `/dashboard/courses/${id}/checkout`}
      />
    </div>
  );
}
