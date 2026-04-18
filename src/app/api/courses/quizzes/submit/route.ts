import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { awardBadges } from "@/lib/badges";
import { logAuditAction } from "@/lib/logger";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { quizId, answers } = await request.json(); // answers: { [questionId: number]: number (answerId) }

        if (!quizId || !answers) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const quiz = await prisma.courseQuiz.findUnique({
            where: { id: parseInt(quizId) },
            include: {
                questions: {
                    include: {
                        answers: true,
                    },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        let earnedPoints = 0;
        let totalPoints = 0;

        const detailedResults = quiz.questions.map((q) => {
            const selectedAnswerId = answers[q.id];
            const correctAnswer = q.answers.find((a) => a.is_correct);
            const isCorrect = selectedAnswerId === correctAnswer?.id;

            totalPoints += q.points;
            if (isCorrect) earnedPoints += q.points;

            return {
                questionId: q.id,
                selectedAnswerId,
                correctAnswerId: correctAnswer?.id,
                isCorrect,
            };
        });

        const score = (earnedPoints / totalPoints) * 100;
        const passed = score >= quiz.passing_score;

        const attempt = await prisma.quizAttempt.create({
            data: {
                user_id: session.user.id,
                quiz_id: quiz.id,
                score,
                total_points: totalPoints,
                earned_points: earnedPoints,
                passed,
                answers_data: JSON.stringify(detailedResults),
            },
        });

        // Generate Certificate if passed
        let certificate = null;
        if (passed) {
            const existingCert = await prisma.certificate.findFirst({
                where: { user_id: session.user.id, course_id: quiz.course_id }
            });

            if (!existingCert) {
                const certNumber = `CERT-${quiz.course_id}-${session.user.id}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
                const verificationCode = Math.random().toString(36).substring(2, 12).toUpperCase();

                certificate = await prisma.certificate.create({
                    data: {
                        user_id: session.user.id,
                        course_id: quiz.course_id,
                        certificate_number: certNumber,
                        verification_code: verificationCode,
                    }
                });
            } else {
                certificate = await prisma.certificate.update({
                    where: { id: existingCert.id },
                    data: { issue_date: new Date(), is_valid: true }
                });
            }
        }

        // Recalculate course progress (lessons + quizzes) and check completion
        const [totalLessons, completedLessons, courseQuizzes, passedAttempts] = await Promise.all([
            prisma.courseLesson.count({ where: { course_id: quiz.course_id } }),
            prisma.lessonProgress.count({
                where: { user_id: session.user.id, is_completed: true, lesson: { course_id: quiz.course_id } },
            }),
            prisma.courseQuiz.findMany({
                where: { course_id: quiz.course_id, is_active: true },
                select: { id: true },
            }),
            prisma.quizAttempt.findMany({
                where: { user_id: session.user.id, passed: true, quiz: { course_id: quiz.course_id } },
                select: { quiz_id: true },
                distinct: ["quiz_id"],
            }),
        ]);
        const passedQuizIds = new Set(passedAttempts.map((a) => a.quiz_id));
        const passedQuizCount = passedQuizIds.size;
        const total = totalLessons + courseQuizzes.length;
        const progressPct = total > 0 ? Math.round(((completedLessons + passedQuizCount) / total) * 100) : 0;
        const allLessonsDone = totalLessons === 0 || completedLessons === totalLessons;
        const allQuizzesPassed = courseQuizzes.every((q) => passedQuizIds.has(q.id));
        const isCourseComplete = allLessonsDone && allQuizzesPassed;

        const enrollmentData: Record<string, unknown> = { progress_percentage: progressPct };
        if (isCourseComplete) {
            enrollmentData.status = "completed";
            enrollmentData.is_completed = true;
            enrollmentData.completion_date = new Date();
        }
        await prisma.courseEnrollment.updateMany({
            where: { user_id: session.user.id, course_id: quiz.course_id },
            data: enrollmentData,
        });

        if (passed) {
            const roundedScore = Math.round(score);
            awardBadges(session.user.id, "quiz_pass", { score: roundedScore }).catch(() => null);
            if (isCourseComplete) {
                awardBadges(session.user.id, "course_complete").catch(() => null);
            }

            logAuditAction({ userId: session.user.id, action: "QUIZ_PASS", resource: `quiz:${quiz.id}`, details: `score:${roundedScore}%` }).catch(() => null);

            prisma.notification.create({
                data: {
                    user_id: session.user.id,
                    title: "Quiz Passed!",
                    message: `You scored ${roundedScore}% on the quiz. ${certificate ? "Your certificate has been generated." : ""}`,
                    type: "success",
                },
            }).catch(() => null);
        }

        return NextResponse.json({
            message: "Quiz submitted successfully",
            score,
            passed,
            attempt,
            certificate,
            progressPct,
            isCourseComplete,
        });
    } catch (error: any) {
        console.error("Quiz submission error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
