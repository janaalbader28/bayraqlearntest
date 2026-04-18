import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { user_id: session.user.id },
      orderBy: { enrollment_date: "desc" },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            title_ar: true,
            short_description: true,
            short_description_ar: true,
            description: true,
            instructor_name: true,
            category: true,
            level: true,
            price: true,
            duration_hours: true,
            thumbnail: true,
            status: true,
            rating: true,
            rating_count: true,
            enrollment_count: true,
            lessons: {
              select: { id: true },
              orderBy: { lesson_order: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    const items = enrollments.map((e) => ({
      id: e.course.id,
      title: e.course.title,
      title_ar: e.course.title_ar ?? null,
      short_description: e.course.short_description ?? null,
      short_description_ar: e.course.short_description_ar ?? null,
      description: e.course.description ?? null,
      instructor_name: e.course.instructor_name,
      category: e.course.category,
      level: String(e.course.level),
      price: Number(e.course.price),
      duration_hours: e.course.duration_hours,
      rating: Number(e.course.rating),
      rating_count: e.course.rating_count,
      enrollment_count: e.course.enrollment_count,
      thumbnail: e.course.thumbnail ?? null,
      status: String(e.course.status),
      first_lesson_id: e.course.lessons[0]?.id ?? null,
    }));

    return NextResponse.json({
      page: 1,
      pageSize: items.length,
      total: items.length,
      hasMore: false,
      items,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

