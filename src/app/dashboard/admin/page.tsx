import prisma from "@/lib/prisma";
import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";

export default async function AdminOverviewPage() {
  const [usersCount, coursesCount, enrollmentCount, avgRatingAgg, popular] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.courseEnrollment.count(),
    prisma.course.aggregate({ _avg: { rating: true } }),
    prisma.course.findMany({
      take: 6,
      orderBy: { enrollment_count: "desc" },
      select: { id: true, title: true, category: true, enrollment_count: true, rating: true, status: true },
    }),
  ]);

  const avgRating = avgRatingAgg._avg.rating != null ? Number(avgRatingAgg._avg.rating) : 4.5;

  return (
    <AdminOverviewClient
      usersCount={usersCount}
      coursesCount={coursesCount}
      enrollmentCount={enrollmentCount}
      avgRating={avgRating}
      popular={popular.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        enrollment_count: c.enrollment_count,
        rating: Number(c.rating || 0),
        status: String(c.status),
      }))}
    />
  );
}
