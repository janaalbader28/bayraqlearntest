import prisma from "@/lib/prisma";
import { BADGE_DEFINITIONS, type BadgeKey } from "@/lib/badge-definitions";
export { BADGE_DEFINITIONS, type BadgeKey } from "@/lib/badge-definitions";

/** Silently award a badge if not already earned. Returns true if newly earned. */
async function award(userId: number, key: BadgeKey): Promise<boolean> {
  try {
    await prisma.userBadge.create({
      data: { user_id: userId, badge_key: key },
    });
    // Notify the user
    const def = BADGE_DEFINITIONS.find((b) => b.key === key);
    if (def) {
      await prisma.notification.create({
        data: {
          user_id: userId,
          title: `Badge Unlocked: ${def.name}`,
          message: def.description,
          type: "achievement",
        },
      });
    }
    return true;
  } catch {
    // Already exists (unique constraint) — that's fine
    return false;
  }
}

/**
 * Evaluate and award badges based on a trigger event.
 * Call this after enrollment or quiz submission.
 *
 * @param userId - the user to evaluate
 * @param trigger - "enrollment" | "quiz_pass" | "course_complete"
 * @param meta - optional extra context (e.g. { score: 100 })
 */
export async function awardBadges(
  userId: number,
  trigger: "enrollment" | "quiz_pass" | "course_complete",
  meta?: { score?: number }
): Promise<void> {
  if (trigger === "enrollment") {
    // Count enrollments
    const count = await prisma.courseEnrollment.count({
      where: { user_id: userId, status: { not: "cancelled" } },
    });
    if (count >= 1) await award(userId, "first_step");
    if (count >= 3) await award(userId, "committed");
  }

  if (trigger === "quiz_pass") {
    const passCount = await prisma.quizAttempt.count({
      where: { user_id: userId, passed: true },
    });
    if (passCount >= 1) await award(userId, "quiz_master");

    // Perfect score badge
    if (meta?.score === 100) {
      await award(userId, "perfect_score");
    }
  }

  if (trigger === "course_complete") {
    const completedEnrollments = await prisma.courseEnrollment.findMany({
      where: { user_id: userId, is_completed: true },
      select: { course: { select: { category: true } } },
    });
    const completedCount = completedEnrollments.length;

    if (completedCount >= 1) await award(userId, "achiever");
    if (completedCount >= 3) await award(userId, "triple_crown");

    // Category explorer: completed courses in 2+ distinct categories
    const categories = new Set(completedEnrollments.map((e) => e.course.category));
    if (categories.size >= 2) await award(userId, "category_explorer");
  }
}
