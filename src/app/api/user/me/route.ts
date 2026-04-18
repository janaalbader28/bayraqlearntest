import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, logout } from "@/lib/auth";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user: {
    id: number;
    username: string;
    email: string;
    role: string;
    nickname: string | null;
    phone_number: string | null;
    specialization: string | null;
    bio: string | null;
    profile_image: string | null;
    country: string | null;
    date_of_birth: Date | null;
    last_login: Date | null;
    last_activity: Date | null;
    created_at: Date;
  } | null = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        nickname: true,
        phone_number: true,
        specialization: true,
        bio: true,
        profile_image: true,
        country: true,
        date_of_birth: true,
        last_login: true,
        last_activity: true,
        created_at: true,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
      const minimal = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          nickname: true,
          phone_number: true,
          specialization: true,
          bio: true,
          profile_image: true,
          country: true,
          date_of_birth: true,
          last_login: true,
          created_at: true,
        },
      });
      user = minimal
        ? {
            ...minimal,
            last_activity: null,
          }
        : null;
    } else {
      throw error;
    }
  }

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      ...user,
      role: String(user.role),
      date_of_birth: user.date_of_birth?.toISOString() ?? null,
      last_login: user.last_login?.toISOString() ?? null,
      last_activity: user.last_activity?.toISOString() ?? null,
      created_at: user.created_at.toISOString(),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const nickname = typeof body.nickname === "string" ? body.nickname.trim() || null : undefined;
  const phone_number = typeof body.phone_number === "string" ? body.phone_number.trim() || null : undefined;
  const specialization = typeof body.specialization === "string" ? body.specialization.trim() || null : undefined;
  const bio = typeof body.bio === "string" ? body.bio.trim() || null : undefined;
  const country = typeof body.country === "string" ? body.country.trim() || null : undefined;
  let date_of_birth: Date | null | undefined;
  if (body.date_of_birth === null || body.date_of_birth === "") {
    date_of_birth = null;
  } else if (typeof body.date_of_birth === "string" && body.date_of_birth) {
    const d = new Date(body.date_of_birth);
    date_of_birth = Number.isNaN(d.getTime()) ? undefined : d;
  }

  const data: Record<string, unknown> = {};
  if (nickname !== undefined) data.nickname = nickname;
  if (phone_number !== undefined) data.phone_number = phone_number;
  if (specialization !== undefined) data.specialization = specialization;
  if (bio !== undefined) data.bio = bio;
  if (country !== undefined) data.country = country;
  if (date_of_birth !== undefined) data.date_of_birth = date_of_birth;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      nickname: true,
      phone_number: true,
      specialization: true,
      bio: true,
      country: true,
      date_of_birth: true,
    },
  });

  return NextResponse.json({
    user: {
      ...updated,
      role: String(updated.role),
      date_of_birth: updated.date_of_birth?.toISOString() ?? null,
    },
  });
}

export async function DELETE() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  await logout();

  return NextResponse.json({ ok: true });
}
