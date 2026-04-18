import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number.parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const cert = await prisma.certificate.findFirst({
    where: { id, user_id: session.user.id },
    include: { course: { select: { title: true } } },
  });

  if (!cert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lines = [
    "BayraqLearn Academy — Certificate",
    "",
    `Course: ${cert.course.title}`,
    `Certificate #: ${cert.certificate_number}`,
    `Verification: ${cert.verification_code}`,
    `Issued: ${cert.issue_date.toISOString().slice(0, 10)}`,
    "",
    "This document confirms course completion.",
  ];

  const body = lines.join("\n");
  const filename = `certificate-${cert.id}.txt`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
