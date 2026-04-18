import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CertificatesClient } from "@/components/dashboard/CertificatesClient";

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?next=/dashboard/certificates");
  }

  const [certificates, completedCount] = await Promise.all([
    prisma.certificate.findMany({
      where: { user_id: session.user.id },
      include: { course: { select: { title: true, title_ar: true, category: true } } },
      orderBy: { issue_date: "desc" },
    }),
    prisma.courseEnrollment.count({
      where: { user_id: session.user.id, is_completed: true },
    }),
  ]);

  // Serialize dates to strings for client component
  const serialized = certificates.map((c) => ({
    id: c.id,
    issue_date: c.issue_date.toISOString(),
    course: {
      title: c.course.title,
      title_ar: c.course.title_ar,
      category: c.course.category,
    },
  }));

  return <CertificatesClient certificates={serialized} completedCount={completedCount} />;
}
