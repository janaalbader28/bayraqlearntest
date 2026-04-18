import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

import { logSecurityEvent } from "@/lib/logger";
import { sendWelcomeEmail } from "@/lib/email";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { username, email, password } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: "student",
            },
        });

        // Send welcome email (best-effort, never blocks registration)
        sendWelcomeEmail({ to: user.email, username: user.username }).catch(() => null);

        return NextResponse.json({ message: "User registered successfully", userId: user.id }, { status: 201 });
    } catch (error: unknown) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
