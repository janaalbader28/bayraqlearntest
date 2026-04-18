/**
 * Seed courses 2, 3, and 4 with modules, lessons, and quizzes.
 * Run: npx tsx scripts/seed-all-courses.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

async function seedCourse(courseId: number, data: {
  modules: Array<{
    name: string;
    lessons: Array<{ title: string; content: string; duration: number }>;
    quiz?: {
      title: string;
      questions: Array<{
        text: string;
        answers: Array<{ text: string; isCorrect: boolean }>;
      }>;
    };
  }>;
}) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    console.log(`Course ID ${courseId} not found, skipping.`);
    return;
  }
  console.log(`\nSeeding course ${courseId}: ${course.title}`);

  // Clear existing lessons and quizzes
  const existingLessons = await prisma.courseLesson.findMany({ where: { course_id: courseId } });
  for (const lesson of existingLessons) {
    await prisma.lessonProgress.deleteMany({ where: { lesson_id: lesson.id } });
  }
  await prisma.courseLesson.deleteMany({ where: { course_id: courseId } });

  const existingQuizzes = await prisma.courseQuiz.findMany({ where: { course_id: courseId } });
  for (const quiz of existingQuizzes) {
    const questions = await prisma.quizQuestion.findMany({ where: { quiz_id: quiz.id } });
    for (const q of questions) {
      await prisma.quizAnswer.deleteMany({ where: { question_id: q.id } });
    }
    await prisma.quizQuestion.deleteMany({ where: { quiz_id: quiz.id } });
  }
  await prisma.courseQuiz.deleteMany({ where: { course_id: courseId } });

  // Create lessons
  let order = 1;
  for (const mod of data.modules) {
    for (const lesson of mod.lessons) {
      const fullContent = `Module: ${mod.name}\nVideo URL: ${VIDEO_URL}\n\n${lesson.content}`;
      const lessonOrd = order++;
      await prisma.courseLesson.create({
        data: {
          course_id: courseId,
          title: lesson.title,
          content: fullContent,
          duration_minutes: lesson.duration,
          lesson_order: lessonOrd,
          is_free: lessonOrd <= 2,
        },
      });
    }
  }

  // Create quizzes
  let quizOrder = 1;
  for (const mod of data.modules) {
    if (!mod.quiz) continue;
    const quiz = await prisma.courseQuiz.create({
      data: {
        course_id: courseId,
        title: mod.quiz.title,
        quiz_order: quizOrder++,
        passing_score: 70,
        time_limit: 20,
        max_attempts: 3,
        is_active: true,
      },
    });
    let qOrder = 1;
    for (const question of mod.quiz.questions) {
      const q = await prisma.quizQuestion.create({
        data: {
          quiz_id: quiz.id,
          question_text: question.text,
          question_type: "multiple_choice",
          question_order: qOrder++,
          points: 1,
        },
      });
      await prisma.quizAnswer.createMany({
        data: question.answers.map((answer) => ({
          question_id: q.id,
          answer_text: answer.text,
          is_correct: answer.isCorrect,
        })),
      });
    }
  }

  const lessonCount = await prisma.courseLesson.count({ where: { course_id: courseId } });
  const quizCount = await prisma.courseQuiz.count({ where: { course_id: courseId } });
  console.log(`  ✓ ${lessonCount} lessons, ${quizCount} quizzes created`);
}

async function main() {
  // Course 2: الاختراق الأخلاقي (Ethical Hacking)
  await seedCourse(2, {
    modules: [
      {
        name: "مقدمة في الاختراق الأخلاقي",
        lessons: [
          {
            title: "ما هو الاختراق الأخلاقي؟",
            content: "تعرف على مفهوم الاختراق الأخلاقي وكيف يختلف عن الاختراق غير المشروع. سنستعرض الأدوار المهنية في مجال أمن المعلومات وما يتطلبه كل دور.",
            duration: 25,
          },
          {
            title: "إعداد بيئة الاختبار",
            content: "كيفية إعداد بيئة اختبار آمنة باستخدام Kali Linux وVirtualBox. سنقوم بتثبيت الأدوات الأساسية وتهيئة الشبكة الافتراضية.",
            duration: 40,
          },
          {
            title: "جمع المعلومات (Reconnaissance)",
            content: "تقنيات جمع المعلومات السلبية والفعالة. استخدام أدوات مثل Nmap وWhois وShodan لجمع بيانات الهدف قبل الاختبار.",
            duration: 35,
          },
        ],
        quiz: {
          title: "اختبار: مقدمة في الاختراق الأخلاقي",
          questions: [
            {
              text: "ما الفرق الرئيسي بين الاختراق الأخلاقي والاختراق الضار؟",
              answers: [
                { text: "الإذن والتفويض القانوني", isCorrect: true },
                { text: "الأدوات المستخدمة", isCorrect: false },
                { text: "سرعة الاختراق", isCorrect: false },
                { text: "نوع الشبكة", isCorrect: false },
              ],
            },
            {
              text: "ما هي أداة Nmap المستخدمة أساساً لـ؟",
              answers: [
                { text: "فحص الشبكات واكتشاف الأجهزة والمنافذ المفتوحة", isCorrect: true },
                { text: "تشفير البيانات", isCorrect: false },
                { text: "بناء جدران الحماية", isCorrect: false },
                { text: "إدارة كلمات المرور", isCorrect: false },
              ],
            },
            {
              text: "ما هو التوزيع الأكثر استخداماً في اختبار الاختراق؟",
              answers: [
                { text: "Kali Linux", isCorrect: true },
                { text: "Ubuntu", isCorrect: false },
                { text: "Windows Server", isCorrect: false },
                { text: "CentOS", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        name: "تقنيات الاستغلال",
        lessons: [
          {
            title: "فهم نقاط الضعف (Vulnerabilities)",
            content: "تصنيف نقاط الضعف حسب قاعدة CVE وNVD. كيفية قراءة التقارير الأمنية وتقييم درجة الخطورة باستخدام CVSS.",
            duration: 30,
          },
          {
            title: "استخدام Metasploit Framework",
            content: "مقدمة عملية في Metasploit Framework. كيفية البحث عن الثغرات واستخدام الـ exploits والـ payloads في بيئة اختبار معزولة.",
            duration: 50,
          },
          {
            title: "الاختراق عبر الويب (Web Application Testing)",
            content: "الثغرات الشائعة في تطبيقات الويب حسب OWASP Top 10. شرح عملي لـ SQL Injection وXSS وCSRF مع أمثلة في بيئة DVWA.",
            duration: 45,
          },
        ],
        quiz: {
          title: "اختبار: تقنيات الاستغلال",
          questions: [
            {
              text: "ما هو CVSS؟",
              answers: [
                { text: "نظام تسجيل معياري لقياس درجة خطورة الثغرات الأمنية", isCorrect: true },
                { text: "أداة لاختراق الشبكات", isCorrect: false },
                { text: "بروتوكول تشفير", isCorrect: false },
                { text: "نوع من الفيروسات", isCorrect: false },
              ],
            },
            {
              text: "ما هي هجمة SQL Injection؟",
              answers: [
                { text: "حقن أوامر SQL في حقول الإدخال للتلاعب بقاعدة البيانات", isCorrect: true },
                { text: "هجوم على بروتوكول SQL", isCorrect: false },
                { text: "سرقة بيانات CSS", isCorrect: false },
                { text: "هجوم على خوادم البريد", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  });

  // Course 3: برمجة بايثون للأمن السيبراني (Python for Cybersecurity)
  await seedCourse(3, {
    modules: [
      {
        name: "أساسيات بايثون للأمن",
        lessons: [
          {
            title: "مقدمة: لماذا بايثون في الأمن السيبراني؟",
            content: "استعراض مزايا بايثون في أتمتة مهام الأمن السيبراني. المكتبات الأساسية مثل socket وos وsubprocess وكيف تُستخدم في أدوات الأمن.",
            duration: 25,
          },
          {
            title: "برمجة الشبكات مع بايثون",
            content: "بناء برامج للتعامل مع الشبكات باستخدام مكتبة socket. كتابة scanner بسيط للمنافذ وأداة لفحص توفر الخوادم.",
            duration: 40,
          },
          {
            title: "التعامل مع الملفات والأنظمة",
            content: "قراءة ملفات اللوغات (logs) وتحليلها برمجياً. استخدام regex للبحث عن الأنماط المشبوهة في ملفات النظام.",
            duration: 35,
          },
        ],
        quiz: {
          title: "اختبار: أساسيات بايثون للأمن",
          questions: [
            {
              text: "ما هي المكتبة الرئيسية في بايثون للتعامل مع الشبكات؟",
              answers: [
                { text: "socket", isCorrect: true },
                { text: "tkinter", isCorrect: false },
                { text: "matplotlib", isCorrect: false },
                { text: "pandas", isCorrect: false },
              ],
            },
            {
              text: "ما هو استخدام مكتبة regex في الأمن السيبراني؟",
              answers: [
                { text: "البحث عن الأنماط المشبوهة في النصوص والملفات", isCorrect: true },
                { text: "تشفير البيانات", isCorrect: false },
                { text: "إنشاء واجهات رسومية", isCorrect: false },
                { text: "إدارة قواعد البيانات", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        name: "أتمتة مهام الأمن",
        lessons: [
          {
            title: "كتابة أدوات الفحص الآلي",
            content: "تطوير أداة فحص ثغرات بسيطة باستخدام بايثون. دمج نتائج Nmap مع بايثون وتحليل المخرجات برمجياً.",
            duration: 50,
          },
          {
            title: "تحليل الحزم مع Scapy",
            content: "مقدمة في مكتبة Scapy لتحليل حزم الشبكة. كيفية التقاط الحزم وتحليل رؤوسها وبناء حزم مخصصة للاختبار.",
            duration: 45,
          },
          {
            title: "أتمتة اختبارات الويب",
            content: "استخدام مكتبات requests وBeautifulSoup لاختبار تطبيقات الويب. بناء أداة بسيطة لفحص XSS وفحص حقول الإدخال.",
            duration: 40,
          },
        ],
        quiz: {
          title: "اختبار: أتمتة مهام الأمن",
          questions: [
            {
              text: "ما هي مكتبة Scapy في بايثون؟",
              answers: [
                { text: "مكتبة لبناء وتحليل حزم الشبكة", isCorrect: true },
                { text: "مكتبة لإدارة الملفات", isCorrect: false },
                { text: "مكتبة لبناء واجهات المستخدم", isCorrect: false },
                { text: "مكتبة للتعلم الآلي", isCorrect: false },
              ],
            },
            {
              text: "ما هي أفضل مكتبة بايثون لإرسال طلبات HTTP؟",
              answers: [
                { text: "requests", isCorrect: true },
                { text: "http.server", isCorrect: false },
                { text: "urllib2", isCorrect: false },
                { text: "flask", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  });

  // Course 4: أمن الشبكات (Network Security)
  await seedCourse(4, {
    modules: [
      {
        name: "أساسيات أمن الشبكات",
        lessons: [
          {
            title: "مبادئ أمن الشبكات",
            content: "مفاهيم CIA Triad (السرية والنزاهة والتوفر). أنواع الهجمات الشبكية الشائعة: DoS وMITM والتنصت. طبقات الأمان في نموذج OSI.",
            duration: 30,
          },
          {
            title: "جدران الحماية وأنظمة كشف التسلل",
            content: "أنواع جدران الحماية: Packet Filter وStateful وProxy. إعداد وتكوين iptables على Linux. أنظمة IDS/IPS: Snort وSuricata كمثال عملي.",
            duration: 45,
          },
          {
            title: "بروتوكولات الأمان الشبكي",
            content: "شرح بروتوكولات TLS/SSL وكيفية عملها. VPN: أنواعه وبروتوكولاته (OpenVPN وWireGuard). بروتوكول IPsec وطبقات الحماية.",
            duration: 40,
          },
        ],
        quiz: {
          title: "اختبار: أساسيات أمن الشبكات",
          questions: [
            {
              text: "ما هي CIA Triad في أمن المعلومات؟",
              answers: [
                { text: "السرية (Confidentiality) والنزاهة (Integrity) والتوفر (Availability)", isCorrect: true },
                { text: "التشفير والمصادقة والتفويض", isCorrect: false },
                { text: "جدار الحماية والمضاد الفيروسات والنسخ الاحتياطي", isCorrect: false },
                { text: "الشبكة والخادم والمستخدم", isCorrect: false },
              ],
            },
            {
              text: "ما هو هجوم Man-in-the-Middle (MITM)؟",
              answers: [
                { text: "اعتراض الاتصالات بين طرفين دون علمهما", isCorrect: true },
                { text: "إغراق الخادم بطلبات كثيرة", isCorrect: false },
                { text: "سرقة كلمات المرور مباشرة", isCorrect: false },
                { text: "اختراق قاعدة البيانات", isCorrect: false },
              ],
            },
            {
              text: "ما الفرق بين IDS وIPS؟",
              answers: [
                { text: "IDS يكتشف فقط بينما IPS يكتشف ويمنع", isCorrect: true },
                { text: "IDS للشبكات وIPS للخوادم", isCorrect: false },
                { text: "IPS أقدم من IDS", isCorrect: false },
                { text: "لا فرق بينهما", isCorrect: false },
              ],
            },
          ],
        },
      },
      {
        name: "التشفير والمصادقة",
        lessons: [
          {
            title: "التشفير المتماثل وغير المتماثل",
            content: "مقارنة بين AES وRSA وأمثلة على استخدامهما. شرح مفهوم المفاتيح العامة والخاصة. تطبيقات عملية: تشفير الملفات والبريد الإلكتروني.",
            duration: 40,
          },
          {
            title: "المصادقة متعددة العوامل (MFA)",
            content: "أنواع عوامل المصادقة: ما تعلمه وما تملكه وما تكونه. تطبيق TOTP باستخدام Google Authenticator. أفضل ممارسات إدارة الهوية.",
            duration: 35,
          },
          {
            title: "بروتوكولات PKI والشهادات الرقمية",
            content: "بنية PKI وشهادات SSL/TLS. كيفية إصدار الشهادات والتحقق منها. Let's Encrypt وإدارة الشهادات في بيئة الإنتاج.",
            duration: 45,
          },
        ],
        quiz: {
          title: "اختبار: التشفير والمصادقة",
          questions: [
            {
              text: "ما هو الفرق الرئيسي بين التشفير المتماثل وغير المتماثل؟",
              answers: [
                { text: "المتماثل يستخدم مفتاحاً واحداً وغير المتماثل يستخدم زوجاً من المفاتيح", isCorrect: true },
                { text: "المتماثل أبطأ دائماً", isCorrect: false },
                { text: "غير المتماثل أقل أماناً", isCorrect: false },
                { text: "لا فرق في مستوى الأمان", isCorrect: false },
              ],
            },
            {
              text: "ما هو TOTP؟",
              answers: [
                { text: "كلمة مرور لمرة واحدة مبنية على الوقت للمصادقة الثنائية", isCorrect: true },
                { text: "بروتوكول تشفير شبكي", isCorrect: false },
                { text: "نوع من جدران الحماية", isCorrect: false },
                { text: "خوارزمية تجزئة", isCorrect: false },
              ],
            },
          ],
        },
      },
    ],
  });

  console.log("\n✅ All courses seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
