import prisma from "@/lib/prisma";
import { HomeNav } from "@/components/marketing/HomeNav";
import { HomePageContent } from "@/components/marketing/HomePageContent";
export const dynamic = "force-dynamic";

type DisplayCourse = {
  id: number;
  title: string;
  title_ar: string | null;
  short_description: string | null;
  short_description_ar: string | null;
  category: string;
  level: string;
  duration_hours: number;
  rating: number;
  rating_count: number;
  price: number;
  status: string;
  thumbnail: string | null;
};

const FALLBACK_COURSES: DisplayCourse[] = [
  {
    id: 0, status: "published", title: "Learning How to Learn",
    title_ar: null, short_description_ar: null, thumbnail: null,
    short_description: "Science-backed techniques for memory, focus, and building lasting study habits.",
    category: "Skills", level: "beginner", duration_hours: 8, rating: 4.9, rating_count: 214, price: 0,
  },
  {
    id: 0, status: "published", title: "Communication & Presentation",
    title_ar: null, short_description_ar: null, thumbnail: null,
    short_description: "Express ideas clearly, structure talks confidently, and engage any audience.",
    category: "Professional", level: "intermediate", duration_hours: 14, rating: 4.8, rating_count: 156, price: 149,
  },
  {
    id: 0, status: "published", title: "Data Literacy Essentials",
    title_ar: null, short_description_ar: null, thumbnail: null,
    short_description: "Read charts responsibly, ask better questions, and make decisions with evidence.",
    category: "Analytics", level: "beginner", duration_hours: 10, rating: 4.7, rating_count: 98, price: 99,
  },
];

export default async function Home() {
  const published = { status: "published" as const };

  const [rows, totalCourses, userCount, hoursSum, ratingAvg] = await Promise.all([
    prisma.course.findMany({
      where: published,
      take: 3,
      orderBy: { created_at: "desc" },
    }),
    prisma.course.count({ where: published }),
    prisma.user.count(),
    prisma.course.aggregate({ where: published, _sum: { duration_hours: true } }),
    prisma.course.aggregate({ where: published, _avg: { rating: true } }),
  ]);

  const displayCourses: DisplayCourse[] =
    rows.length > 0
      ? rows.map((c) => ({
          id: c.id,
          title: c.title,
          title_ar: c.title_ar ?? null,
          short_description: c.short_description ?? null,
          short_description_ar: c.short_description_ar ?? null,
          thumbnail: c.thumbnail ?? null,
          category: c.category,
          level: c.level,
          duration_hours: c.duration_hours,
          rating: Number(c.rating),
          rating_count: c.rating_count,
          price: Number(c.price),
          status: String(c.status),
        }))
      : FALLBACK_COURSES;

  const totalHours = hoursSum._sum.duration_hours ?? 0;
  const avgRating = ratingAvg._avg.rating != null ? Number(ratingAvg._avg.rating) : 4.5;

  const hoursTarget = totalHours > 0 ? totalHours : 2400;
  const coursesTarget = totalCourses > 0 ? totalCourses : 48;
  const learnersTarget = userCount > 0 ? userCount : 3200;
  const ratingTarget = Math.max(avgRating, 4.5);

  return (
    <>
      <HomeNav />
      <HomePageContent
        displayCourses={displayCourses}
        hoursTarget={hoursTarget}
        coursesTarget={coursesTarget}
        learnersTarget={learnersTarget}
        ratingTarget={ratingTarget}
      />
    </>
  );
}
