import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
  }

  const ext = (() => {
    const t = file.type;
    if (t === "image/png") return "png";
    if (t === "image/jpeg" || t === "image/jpg") return "jpg";
    if (t === "image/webp") return "webp";
    if (t === "image/gif") return "gif";
    return null;
  })();
  if (!ext) {
    return NextResponse.json({ error: "Use PNG, JPG, WebP, or GIF" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads", "thumbnails");
  await mkdir(dir, { recursive: true });

  const filename = `thumb_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buf);

  return NextResponse.json({ url: `/uploads/thumbnails/${filename}` });
}
