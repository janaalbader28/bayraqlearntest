/** Badge definitions — safe to import in client components (no server/DB imports). */
export const BADGE_DEFINITIONS = [
  {
    key: "first_step",
    name: "First Step",
    name_ar: "الخطوة الأولى",
    description: "Enrolled in your first course",
    description_ar: "سجّلت في دورتك الأولى",
    icon: "🚀",
  },
  {
    key: "committed",
    name: "Committed",
    name_ar: "ملتزم",
    description: "Enrolled in 3 or more courses",
    description_ar: "سجّلت في 3 دورات أو أكثر",
    icon: "📚",
  },
  {
    key: "achiever",
    name: "Achiever",
    name_ar: "المنجز",
    description: "Completed your first course",
    description_ar: "أكملت دورتك الأولى",
    icon: "🏆",
  },
  {
    key: "triple_crown",
    name: "Triple Crown",
    name_ar: "التاج الثلاثي",
    description: "Completed 3 courses",
    description_ar: "أكملت 3 دورات",
    icon: "👑",
  },
  {
    key: "quiz_master",
    name: "Quiz Master",
    name_ar: "سيد الاختبارات",
    description: "Passed your first quiz",
    description_ar: "اجتزت اختبارك الأول",
    icon: "🧠",
  },
  {
    key: "perfect_score",
    name: "Perfect Score",
    name_ar: "الدرجة الكاملة",
    description: "Achieved 100% on a quiz",
    description_ar: "حصلت على 100% في اختبار",
    icon: "⭐",
  },
  {
    key: "category_explorer",
    name: "Category Explorer",
    name_ar: "مستكشف الفئات",
    description: "Completed courses in 2 different categories",
    description_ar: "أكملت دورات في فئتين مختلفتين",
    icon: "🗺️",
  },
] as const;

export type BadgeKey = (typeof BADGE_DEFINITIONS)[number]["key"];
