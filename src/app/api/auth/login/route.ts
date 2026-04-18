import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { login } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/logger";
export const dynamic = "force-dynamic";

const LOGIN_USER_SELECT = {
    id: true,
    email: true,
    username: true,
    password: true,
    role: true,
    is_active: true,
} as const;

async function passwordsMatch(plain: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !plain) return false;
    try {
        return await bcrypt.compare(plain, storedHash);
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    let email: string;
    let password: string;

    try {
        const body: unknown = await request.json();
        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        const rec = body as Record<string, unknown>;
        const rawEmail = rec.email;
        const rawPassword = rec.password;
        if (typeof rawEmail !== "string" || typeof rawPassword !== "string") {
            return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        }
        email = rawEmail.trim();
        password = rawPassword;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!email || !password) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: LOGIN_USER_SELECT,
        });

        const validPassword = await passwordsMatch(password, user?.password ?? "");
        if (!user || !validPassword) {
            await logSecurityEvent({
                event_type: "AUTH_FAILURE",
                description: `Failed login attempt for email: ${email}`,
                severity: "MEDIUM",
                user_agent: request.headers.get("user-agent") || undefined,
            });
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        if (!user.is_active) {
            return NextResponse.json({ error: "Account is disabled" }, { status: 403 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() },
            select: { id: true },
        });

        await login({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        await logSecurityEvent({
            userId: user.id,
            event_type: "AUTH_SUCCESS",
            description: `User successfully authenticated: ${user.email}`,
            severity: "INFO",
            user_agent: request.headers.get("user-agent") || undefined,
        });

        return NextResponse.json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: unknown) {
        console.error("Login error:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2022") {
                return NextResponse.json(
                    {
                        error:
                            "Database schema is out of sync with the application. Apply Prisma migrations or run `npx prisma db push` after backup.",
                    },
                    { status: 503 },
                );
            }
            if (error.code === "P1001") {
                return NextResponse.json({ error: "Database is unavailable. Try again later." }, { status: 503 });
            }
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
