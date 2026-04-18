import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { CourseStatus, Level } from "@prisma/client";

function asInt(value: string | null, fallback: number): number {
  const n = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(n) ? n : fallback;
}

function normalizeQuery(value: string | null): string {
  return (value ?? "").trim();
}

function parseDurationRange(range: string | null): { min?: number; max?: number } | null {
  const raw = normalizeQuery(range);
  if (!raw) return null;

  if (raw === "0-5") return { min: 0, max: 5 };
  if (raw === "6-10") return { min: 6, max: 10 };
  if (raw === "11-20") return { min: 11, max: 20 };
  if (raw === "20+") return { min: 20 };

  return null;
}

function parseLevel(raw: string | null): Level | undefined {
  const value = normalizeQuery(raw).toLowerCase();
  if (!value) return undefined;
  if (value === "beginner" || value === "intermediate" || value === "advanced") return value;
  return undefined;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = normalizeQuery(searchParams.get("q"));
    const category = normalizeQuery(searchParams.get("category"));
    const level = parseLevel(searchParams.get("level"));
    const duration = parseDurationRange(searchParams.get("duration"));

    const page = Math.max(1, asInt(searchParams.get("page"), 1));
    const pageSize = Math.min(24, Math.max(6, asInt(searchParams.get("pageSize"), 9)));
    const skip = (page - 1) * pageSize;

    const statusIn: CourseStatus[] = ["published"];

    const where = {
      status: { in: statusIn },
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { short_description: { contains: q } },
              { description: { contains: q } },
              { category: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
      ...(category && category !== "All" ? { category } : {}),
      ...(level ? { level } : {}),
      ...(duration
        ? {
            duration_hours: {
              ...(typeof duration.min === "number" ? { gte: duration.min } : {}),
              ...(typeof duration.max === "number" ? { lte: duration.max } : {}),
            },
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        orderBy: [{ is_featured: "desc" }, { enrollment_count: "desc" }, { created_at: "desc" }],
        skip,
        take: pageSize,
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
          tags: true,
          rating: true,
          rating_count: true,
          enrollment_count: true,
          lessons: {
            select: { id: true },
            orderBy: { lesson_order: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    const serialized = items.map((c) => ({
      id: c.id,
      title: c.title,
      title_ar: c.title_ar,
      short_description: c.short_description,
      short_description_ar: c.short_description_ar,
      description: c.description,
      instructor_name: c.instructor_name,
      category: c.category,
      level: String(c.level),
      duration_hours: c.duration_hours,
      thumbnail: c.thumbnail,
      status: String(c.status),
      tags: c.tags,
      price: Number(c.price),
      rating: Number(c.rating),
      rating_count: c.rating_count,
      enrollment_count: c.enrollment_count,
      first_lesson_id: c.lessons[0]?.id ?? null,
    }));

    return NextResponse.json({
      page,
      pageSize,
      total,
      hasMore: skip + serialized.length < total,
      items: serialized,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

