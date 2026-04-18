import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const quiz = await prisma.courseQuiz.findUnique({
            where: { id: parseInt(id, 10) },
            include: {
                questions: {
                    include: {
                        answers: {
                            // We don't want to send 'is_correct' to the client!
                            select: {
                                id: true,
                                answer_text: true,
                            }
                        },
                    },
                    orderBy: { question_order: "asc" },
                },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Quiz fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
