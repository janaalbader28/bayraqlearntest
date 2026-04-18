import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function POST() {
    await logout();
    return NextResponse.json({ message: "Logged out successfully" });
}
