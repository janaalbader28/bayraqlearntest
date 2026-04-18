import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
import { logAuditAction } from "@/lib/logger";
import type { CourseStatus, Level } from "@prisma/client";
export const dynamic = "force-dynamic";
function parseStatus(raw: unknown): CourseStatus | undefined {
  if (raw === "published" || raw === "draft" || raw === "archived") return raw;
  if (raw === "open") return "published";
  if (raw === "closed") return "archived";
  return undefined;
}

function parseLevel(raw: unknown): Level | undefined {
  if (raw === "beginner" || raw === "intermediate" || raw === "advanced") return raw;
  return undefined;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const course = await prisma.course.findUnique({
    where: { id },
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
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse lessons back into module groups
  type ParsedLesson = { title: string; video_url: string; duration_minutes: string };
  type ParsedModule = { title: string; lessons: ParsedLesson[] };
  const moduleMap: ParsedModule[] = [];
  for (const lesson of course.lessons) {
    let moduleTitle = "";
    let videoUrl = "";
    for (const line of (lesson.content || "").split("\n")) {
      if (line.startsWith("Module: ")) moduleTitle = line.slice(8);
      else if (line.startsWith("Video URL: ")) videoUrl = line.slice(11);
    }
    const existing = moduleMap.find((m) => m.title === moduleTitle);
    if (existing) {
      existing.lessons.push({ title: lesson.title, video_url: videoUrl, duration_minutes: String(lesson.duration_minutes ?? 10) });
    } else {
      moduleMap.push({ title: moduleTitle, lessons: [{ title: lesson.title, video_url: videoUrl, duration_minutes: String(lesson.duration_minutes ?? 10) }] });
    }
  }

  // Parse quizzes with questions and answers
  const parsedQuizzes = course.quizzes.map((quiz) => {
    let moduleTitle = "";
    for (const line of (quiz.description || "").split("\n")) {
      if (line.startsWith("Module: ")) moduleTitle = line.slice(8);
    }
    return {
      title: quiz.title,
      module_title: moduleTitle,
      passing_score: String(quiz.passing_score ?? 70),
      questions: quiz.questions.map((q) => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.answers.map((a) => a.answer_text),
        correct_index: Math.max(0, q.answers.findIndex((a) => a.is_correct)),
      })),
    };
  });

  return NextResponse.json({
    course: {
      ...course,
      price: Number(course.price),
      rating: Number(course.rating),
      level: String(course.level),
      status: String(course.status),
      lessons: undefined,
      quizzes: undefined,
    },
    modules: moduleMap,
    quizzes: parsedQuizzes,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.title_ar === "string" || body.title_ar === null) data.title_ar = body.title_ar || null;
  if (typeof body.description === "string" || body.description === null) data.description = body.description;
  if (typeof body.description_ar === "string" || body.description_ar === null) data.description_ar = body.description_ar || null;
  if (typeof body.short_description === "string" || body.short_description === null)
    data.short_description = body.short_description;
  if (typeof body.short_description_ar === "string" || body.short_description_ar === null)
    data.short_description_ar = body.short_description_ar || null;
  if (typeof body.instructor_name === "string") data.instructor_name = body.instructor_name.trim();
  if (typeof body.category === "string") data.category = body.category.trim();
  if (typeof body.thumbnail === "string" || body.thumbnail === null) data.thumbnail = body.thumbnail || null;
  if (typeof body.preview_video === "string" || body.preview_video === null) data.preview_video = body.preview_video;
  if (typeof body.zoom_link === "string" || body.zoom_link === null) data.zoom_link = body.zoom_link || null;
  if (typeof body.schedule_json === "string" || body.schedule_json === null) data.schedule_json = body.schedule_json;
  if (typeof body.whatsapp_link === "string" || body.whatsapp_link === null) data.whatsapp_link = body.whatsapp_link || null;
  const st = parseStatus(body.status);
  if (st) data.status = st;
  const lv = parseLevel(body.level);
  if (lv) data.level = lv;
  if (body.price !== undefined) data.price = Number(body.price) || 0;
  if (body.duration_hours !== undefined) data.duration_hours = Number.parseInt(String(body.duration_hours), 10) || 0;
  if (typeof body.is_featured === "boolean") data.is_featured = body.is_featured;

  const hasModules = "modules" in body;
  const hasQuizzes = "quizzes" in body;

  type LessonInput = { title?: string; video_url?: string; duration_minutes?: number | string };
  type ModuleInput = { title?: string; lessons?: LessonInput[] };
  type QuestionInput = { question_text?: string; question_type?: string; options?: string[]; correct_index?: number };
  type QuizInput = { title?: string; module_title?: string; passing_score?: number | string; questions?: QuestionInput[] };

  const course = await prisma.$transaction(async (tx) => {
    const updated = await tx.course.update({ where: { id }, data: data as object });

    if (hasModules) {
      // Delete existing lessons (cascades LessonProgress)
      await tx.courseLesson.deleteMany({ where: { course_id: id } });

      const moduleList: ModuleInput[] = Array.isArray(body.modules) ? (body.modules as ModuleInput[]) : [];
      let lessonOrder = 1;
      for (const moduleItem of moduleList) {
        const lessons = Array.isArray(moduleItem?.lessons) ? moduleItem.lessons : [];
        for (const lesson of lessons) {
          const lessonTitle = String(lesson?.title || "").trim();
          if (!lessonTitle) continue;
          const videoUrl = String(lesson?.video_url || "").trim();
          const moduleTitle = String(moduleItem?.title || "").trim();
          const contentLines = [moduleTitle ? `Module: ${moduleTitle}` : null, videoUrl ? `Video URL: ${videoUrl}` : null]
            .filter(Boolean)
            .join("\n");
          await tx.courseLesson.create({
            data: {
              course_id: id,
              title: lessonTitle,
              content: contentLines || null,
              lesson_order: lessonOrder++,
              duration_minutes: Number(lesson?.duration_minutes || 0) || 0,
            },
          });
        }
      }
    }

    if (hasQuizzes) {
      // Delete existing quizzes (cascades QuizQuestion, QuizAnswer, QuizAttempt)
      await tx.courseQuiz.deleteMany({ where: { course_id: id } });

      const quizList: QuizInput[] = Array.isArray(body.quizzes) ? (body.quizzes as QuizInput[]) : [];
      let quizOrder = 1;
      for (const q of quizList) {
        const quizTitle = String(q?.title || "").trim();
        if (!quizTitle) continue;
        const moduleTitle = String(q?.module_title || "").trim();
        const quiz = await tx.courseQuiz.create({
          data: {
            course_id: id,
            title: quizTitle,
            description: moduleTitle ? `Module: ${moduleTitle}` : null,
            passing_score: Number(q?.passing_score || 70) || 70,
            quiz_order: quizOrder++,
          },
        });

        const questions = Array.isArray(q?.questions) ? q.questions : [];
        let questionOrder = 1;
        for (const question of questions) {
          const questionText = String(question?.question_text || "").trim();
          if (!questionText) continue;
          const createdQuestion = await tx.quizQuestion.create({
            data: {
              quiz_id: quiz.id,
              question_text: questionText,
              question_type: String(question?.question_type || "multiple_choice"),
              question_order: questionOrder++,
            },
          });

          const options = Array.isArray(question?.options) ? question.options : [];
          const correct = Number(question?.correct_index ?? -1);
          for (let i = 0; i < options.length; i++) {
            const text = String(options[i] || "").trim();
            if (!text) continue;
            await tx.quizAnswer.create({
              data: {
                question_id: createdQuestion.id,
                answer_text: text,
                is_correct: i === correct,
              },
            });
          }
        }
      }
    }

    return updated;
  });

  await logAuditAction({
    userId: session.user.id,
    action: "UPDATE_COURSE",
    resource: `Course:${id}`,
    details: `Updated course: ${course.title}`,
  });

  return NextResponse.json({ course });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.course.delete({ where: { id } });

  await logAuditAction({
    userId: session.user.id,
    action: "DELETE_COURSE",
    resource: `Course:${id}`,
    details: `Deleted course: ${existing.title}`,
  });

  return NextResponse.json({ ok: true });
}
