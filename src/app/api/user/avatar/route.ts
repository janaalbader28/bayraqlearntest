import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
  }

  const ext = (() => {
    const t = file.type;
    if (t === "image/png") return "png";
    if (t === "image/jpeg" || t === "image/jpg") return "jpg";
    if (t === "image/webp") return "webp";
    return null;
  })();
  if (!ext) {
    return NextResponse.json({ error: "Use PNG, JPG, or WebP" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  const filename = `${session.user.id}.${ext}`;
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buf);

  const publicPath = `/uploads/avatars/${filename}`;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { profile_image: publicPath },
  });

  return NextResponse.json({ profile_image: publicPath });
}
