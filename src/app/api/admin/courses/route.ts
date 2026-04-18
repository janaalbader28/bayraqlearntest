import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
import { logAuditAction } from "@/lib/logger";
import type { CourseStatus } from "@prisma/client";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id || !isAdminRole(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            title_ar,
            description,
            description_ar,
            short_description,
            short_description_ar,
            instructor_name,
            category,
            level,
            price,
            duration_hours,
            status,
            thumbnail,
            preview_video,
            is_featured,
            is_live_course,
            zoom_link,
            schedule_json,
            whatsapp_link,
            modules,
            quizzes,
        } = body;

        if (!title || !instructor_name || !category) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        let courseStatus: CourseStatus = "published";
        if (status === "draft" || status === "archived" || status === "published") courseStatus = status;
        if (status === "closed") courseStatus = "archived";
        if (status === "open") courseStatus = "published";

        const course = await prisma.$transaction(async (tx) => {
            const created = await tx.course.create({
                data: {
                    title,
                    title_ar: title_ar || null,
                    description,
                    description_ar: description_ar || null,
                    short_description,
                    short_description_ar: short_description_ar || null,
                    instructor_name,
                    category,
                    level: level || "beginner",
                    price: parseFloat(price) || 0,
                    duration_hours: parseInt(duration_hours, 10) || 0,
                    status: courseStatus,
                    thumbnail: thumbnail || null,
                    preview_video: preview_video || null,
                    is_featured: Boolean(is_featured),
                    is_live_course: Boolean(is_live_course),
                    zoom_link: Boolean(is_live_course) ? (zoom_link || null) : null,
                    schedule_json: Boolean(is_live_course) ? (schedule_json || null) : null,
                    whatsapp_link: Boolean(is_live_course) ? (whatsapp_link || null) : null,
                },
            });

            const moduleList: Array<{
                title?: string;
                lessons?: Array<{ title?: string; video_url?: string; duration_minutes?: number | string }>;
            }> = Array.isArray(modules) ? modules : [];

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
                            course_id: created.id,
                            title: lessonTitle,
                            content: contentLines || null,
                            lesson_order: lessonOrder++,
                            duration_minutes: Number(lesson?.duration_minutes || 0) || 0,
                        },
                    });
                }
            }

            const quizList: Array<{
                title?: string;
                description?: string;
                passing_score?: number | string;
                module_title?: string;
                questions?: Array<{
                    question_text?: string;
                    question_type?: string;
                    options?: string[];
                    correct_index?: number;
                }>;
            }> = Array.isArray(quizzes) ? quizzes : [];

            let quizOrder = 1;
            for (const q of quizList) {
                const quizTitle = String(q?.title || "").trim();
                if (!quizTitle) continue;
                const moduleTitle = String(q?.module_title || "").trim();
                const quiz = await tx.courseQuiz.create({
                    data: {
                        course_id: created.id,
                        title: quizTitle,
                        description: [moduleTitle ? `Module: ${moduleTitle}` : null, String(q?.description || "").trim()]
                            .filter(Boolean)
                            .join("\n") || null,
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

            return created;
        });

        await logAuditAction({
            userId: session.user.id,
            action: "CREATE_COURSE",
            resource: `Course:${course.id}`,
            details: `Admin created new course module: ${title}`,
        });

        return NextResponse.json({ message: "Course deployed successfully", course });
    } catch (error: unknown) {
        console.error("Course creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
