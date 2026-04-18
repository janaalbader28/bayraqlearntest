/**
 * POST /api/admin/courses/[id]/send-reminders
 *
 * Sends reminder emails to all active enrollments of a live course.
 * Admin only.
 *
 * Body (optional): { hours_before: 24 }
 *   hours_before — used in the email copy, default 24
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
import { sendReminderEmail } from "@/lib/email";
export const dynamic = "force-dynamic";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      is_live_course: true,
      zoom_link: true,
      schedule_json: true,
      whatsapp_link: true,
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (!course.is_live_course) {
    return NextResponse.json({ error: "Reminders are only for live courses" }, { status: 400 });
  }
  if (!course.zoom_link) {
    return NextResponse.json({ error: "Course has no Zoom link" }, { status: 400 });
  }

  // Parse schedule to get the next session day/time
  let sessionDay = "Upcoming session";
  let sessionStart = "";
  let sessionEnd = "";
  if (course.schedule_json) {
    try {
      const sched = JSON.parse(course.schedule_json) as {
        sessions?: Array<{ day?: string; start_time?: string; end_time?: string }>;
      };
      const first = sched.sessions?.[0];
      if (first) {
        sessionDay = first.day ?? sessionDay;
        sessionStart = first.start_time ?? "";
        sessionEnd = first.end_time ?? "";
      }
    } catch {}
  }

  // Parse hours_before from body
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const hoursBefore = Number(body.hours_before ?? 24) || 24;

  // Get all active enrollments with user email
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { course_id: id, status: "active" },
    select: {
      user: { select: { email: true, username: true } },
    },
  });

  if (enrollments.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No active enrollments found." });
  }

  // Send reminder emails concurrently (best-effort, collect results)
  const results = await Promise.allSettled(
    enrollments.map((e) =>
      sendReminderEmail({
        to: e.user.email,
        username: e.user.username,
        courseTitle: course.title,
        sessionDay,
        sessionStart,
        sessionEnd,
        zoomLink: course.zoom_link!,
        hoursBeforeSession: hoursBefore,
        whatsappLink: course.whatsapp_link ?? null,
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    total: enrollments.length,
    message: `Reminder emails sent to ${sent} of ${enrollments.length} enrolled students.`,
  });
}
