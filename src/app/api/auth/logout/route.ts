import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST() {
    await logout();
    return NextResponse.json({ message: "Logged out successfully" });
}
