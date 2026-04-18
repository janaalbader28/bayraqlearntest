/**
 * Rich course seed script — adds full modules, lessons, and quizzes
 * to the first published course found in the database.
 *
 * Run with:  npx tsx scripts/seed-rich-course.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lessonContent(moduleName: string, videoId: string, body: string): string {
  return [
    `Module: ${moduleName}`,
    `Video URL: https://www.youtube.com/watch?v=${videoId}`,
    '',
    body,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const MODULES = [
  {
    name: 'Module 1: Foundations of Threat Intelligence',
    lessons: [
      {
        title: 'What is a Security Operations Center?',
        duration_minutes: 22,
        videoId: 'dQw4w9WgXcQ',
        body: 'Get a bird\'s-eye view of a modern SOC — its mission, team structure, tier levels (L1/L2/L3), and the tools analysts rely on daily. By the end of this lesson you will know exactly where you fit in.',
      },
      {
        title: 'Understanding the Threat Landscape',
        duration_minutes: 30,
        videoId: 'dQw4w9WgXcQ',
        body: 'From nation-state APTs to opportunistic ransomware gangs — learn how adversaries are categorised, motivated, and tracked. Introduces the MITRE ATT&CK matrix and the Cyber Kill Chain framework.',
      },
      {
        title: 'Setting Up Your Virtual Lab',
        duration_minutes: 25,
        videoId: 'dQw4w9WgXcQ',
        body: 'Step-by-step guide to building a safe, isolated practice environment using VirtualBox and pre-built security VMs (Kali Linux, FLARE-VM, Security Onion). Everything you need is free.',
      },
    ],
  },
  {
    name: 'Module 2: SIEM & Log Analysis',
    lessons: [
      {
        title: 'Introduction to SIEM Platforms',
        duration_minutes: 35,
        videoId: 'dQw4w9WgXcQ',
        body: 'SIEM (Security Information & Event Management) is the nerve-centre of every SOC. This lesson covers the architecture of platforms like Splunk, QRadar, and the open-source ELK Stack, plus how log ingestion pipelines work.',
      },
      {
        title: 'ELK Stack: Ingesting & Querying Logs',
        duration_minutes: 45,
        videoId: 'dQw4w9WgXcQ',
        body: 'Hands-on walkthrough: install Elasticsearch, Logstash, and Kibana; ship Windows Event logs via Winlogbeat; write your first KQL queries to hunt for failed login attempts and privilege escalation indicators.',
      },
      {
        title: 'Detecting Anomalies with Correlation Rules',
        duration_minutes: 40,
        videoId: 'dQw4w9WgXcQ',
        body: 'Learn how SIEM correlation rules turn raw events into actionable alerts. We build three real-world rules: brute-force detection, impossible travel, and DNS tunnelling — then tune them to reduce false positives.',
      },
    ],
  },
  {
    name: 'Module 3: Incident Response',
    lessons: [
      {
        title: 'IR Frameworks: NIST & SANS',
        duration_minutes: 28,
        videoId: 'dQw4w9WgXcQ',
        body: 'Walk through the six phases of the NIST SP 800-61 Incident Response lifecycle: Preparation → Detection → Containment → Eradication → Recovery → Post-Incident. Compare with the SANS PICERL model and learn when each applies.',
      },
      {
        title: 'Triage, Containment & Remediation',
        duration_minutes: 38,
        videoId: 'dQw4w9WgXcQ',
        body: 'When an alert fires, every second counts. Master rapid triage techniques, network and host isolation strategies, and the decision tree for escalating an incident from L1 to L2. Includes a live tabletop scenario.',
      },
      {
        title: 'Digital Evidence Collection & Chain of Custody',
        duration_minutes: 30,
        videoId: 'dQw4w9WgXcQ',
        body: 'Proper evidence handling is what separates professional responders from amateurs. This lesson covers forensic imaging with FTK Imager, memory acquisition with Volatility, and writing legally sound chain-of-custody documentation.',
      },
    ],
  },
  {
    name: 'Module 4: Proactive Threat Hunting',
    lessons: [
      {
        title: 'From Reactive to Proactive: Hunting Mindset',
        duration_minutes: 32,
        videoId: 'dQw4w9WgXcQ',
        body: 'Threat hunting assumes the adversary is already inside. Learn hypothesis-driven hunting, the difference between indicator-based and behaviour-based approaches, and how to structure a hunt engagement from kick-off to report.',
      },
      {
        title: 'MITRE ATT&CK Navigator: Mapping Techniques',
        duration_minutes: 48,
        videoId: 'dQw4w9WgXcQ',
        body: 'The ATT&CK Navigator is your threat-hunting map. We load real adversary profiles (APT29, Lazarus Group), generate heat maps of the most-used techniques in your sector, and convert them into actionable hunt queries.',
      },
      {
        title: 'Building & Deploying Detection Rules',
        duration_minutes: 55,
        videoId: 'dQw4w9WgXcQ',
        body: 'Capstone lesson: write Sigma rules and convert them to Splunk/Elastic queries, deploy them in your SIEM, validate with Atomic Red Team tests, and measure detection coverage against the ATT&CK matrix. Ship your first detection-as-code PR.',
      },
    ],
  },
];

const QUIZZES = [
  {
    title: 'Module 1 Quiz: SOC Fundamentals',
    passing_score: 70,
    quiz_order: 1,
    questions: [
      {
        text: 'Which tier in a typical SOC is responsible for initial alert triage and basic investigation?',
        order: 1,
        answers: [
          { text: 'Tier 1 (L1) Analyst', correct: true },
          { text: 'Tier 3 (L3) Threat Hunter', correct: false },
          { text: 'SOC Manager', correct: false },
          { text: 'Digital Forensics Examiner', correct: false },
        ],
      },
      {
        text: 'The Cyber Kill Chain model was originally developed by which organisation?',
        order: 2,
        answers: [
          { text: 'Lockheed Martin', correct: true },
          { text: 'MITRE Corporation', correct: false },
          { text: 'SANS Institute', correct: false },
          { text: 'NIST', correct: false },
        ],
      },
      {
        text: 'In the MITRE ATT&CK framework, what does the "Tactics" column represent?',
        order: 3,
        answers: [
          { text: 'The adversary\'s high-level goal (e.g., Initial Access, Persistence)', correct: true },
          { text: 'The specific technical implementation of an attack', correct: false },
          { text: 'Defensive countermeasures and mitigations', correct: false },
          { text: 'A list of known threat actor groups', correct: false },
        ],
      },
    ],
  },
  {
    title: 'Module 2 Quiz: SIEM & Log Analysis',
    passing_score: 70,
    quiz_order: 2,
    questions: [
      {
        text: 'Which component of the ELK Stack is responsible for collecting and forwarding log data?',
        order: 1,
        answers: [
          { text: 'Beats (e.g., Winlogbeat, Filebeat)', correct: true },
          { text: 'Kibana', correct: false },
          { text: 'Elasticsearch', correct: false },
          { text: 'Logstash filters', correct: false },
        ],
      },
      {
        text: 'A SIEM correlation rule that fires after 10 failed logins from the same IP within 60 seconds is detecting which attack type?',
        order: 2,
        answers: [
          { text: 'Brute-force / credential stuffing', correct: true },
          { text: 'DNS tunnelling', correct: false },
          { text: 'SQL injection', correct: false },
          { text: 'ARP spoofing', correct: false },
        ],
      },
      {
        text: 'What is the primary purpose of a SIEM baseline?',
        order: 3,
        answers: [
          { text: 'To define normal behaviour so that deviations can be flagged as anomalies', correct: true },
          { text: 'To store raw log data for compliance archiving', correct: false },
          { text: 'To visualise network topology in real-time', correct: false },
          { text: 'To automatically block malicious IPs', correct: false },
        ],
      },
    ],
  },
  {
    title: 'Module 3 Quiz: Incident Response',
    passing_score: 75,
    quiz_order: 3,
    questions: [
      {
        text: 'According to NIST SP 800-61, which phase directly follows "Detection & Analysis"?',
        order: 1,
        answers: [
          { text: 'Containment, Eradication, and Recovery', correct: true },
          { text: 'Post-Incident Activity', correct: false },
          { text: 'Preparation', correct: false },
          { text: 'Identification', correct: false },
        ],
      },
      {
        text: 'A forensic image created with FTK Imager is verified using which mechanism to prove integrity?',
        order: 2,
        answers: [
          { text: 'Cryptographic hash comparison (MD5/SHA-256)', correct: true },
          { text: 'File size comparison', correct: false },
          { text: 'Timestamp verification', correct: false },
          { text: 'Digital signature from the vendor', correct: false },
        ],
      },
      {
        text: 'During a ransomware incident, what is the FIRST action an L1 analyst should take after detection?',
        order: 3,
        answers: [
          { text: 'Isolate the affected host from the network immediately', correct: true },
          { text: 'Wipe and reimage the infected machine', correct: false },
          { text: 'Pay the ransom to recover data quickly', correct: false },
          { text: 'Send an email report to management', correct: false },
        ],
      },
      {
        text: 'Which Volatility command lists all running processes from a memory dump?',
        order: 4,
        answers: [
          { text: 'pslist or pstree', correct: true },
          { text: 'dlllist', correct: false },
          { text: 'netscan', correct: false },
          { text: 'malfind', correct: false },
        ],
      },
    ],
  },
  {
    title: 'Final Exam: Certified SOC Analyst L1',
    passing_score: 80,
    quiz_order: 4,
    questions: [
      {
        text: 'An analyst notices outbound DNS queries of 200+ characters to a single external domain every 30 seconds. What attack is most likely occurring?',
        order: 1,
        answers: [
          { text: 'DNS tunnelling (data exfiltration or C2 channel)', correct: true },
          { text: 'DDoS amplification attack', correct: false },
          { text: 'BGP hijacking', correct: false },
          { text: 'SNMP brute-force', correct: false },
        ],
      },
      {
        text: 'Which ATT&CK technique number corresponds to "Spearphishing Attachment" (Initial Access)?',
        order: 2,
        answers: [
          { text: 'T1566.001', correct: true },
          { text: 'T1059.001', correct: false },
          { text: 'T1078', correct: false },
          { text: 'T1021.002', correct: false },
        ],
      },
      {
        text: 'A Golden Ticket attack in Active Directory forges which type of Kerberos ticket?',
        order: 3,
        answers: [
          { text: 'Ticket Granting Ticket (TGT)', correct: true },
          { text: 'Service Ticket (TGS)', correct: false },
          { text: 'Kerberos Authenticator', correct: false },
          { text: 'AS-REP token', correct: false },
        ],
      },
      {
        text: 'What does the Sigma rule format allow security teams to do?',
        order: 4,
        answers: [
          { text: 'Write vendor-agnostic detection rules convertible to any SIEM query language', correct: true },
          { text: 'Define firewall ACLs in a portable format', correct: false },
          { text: 'Automate penetration testing workflows', correct: false },
          { text: 'Generate threat intelligence reports from raw packet captures', correct: false },
        ],
      },
      {
        text: 'In a proper incident response chain of custody, what must be recorded for every piece of digital evidence?',
        order: 5,
        answers: [
          { text: 'Who collected it, when, where, how it was stored, and every person who accessed it', correct: true },
          { text: 'Only the hash value of the original evidence', correct: false },
          { text: 'The name of the analyst who reported the incident', correct: false },
          { text: 'The IP address of the source machine only', correct: false },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🔍  Looking for a course to enrich...');

  // Find the first published course, or fall back to any course
  let course = await prisma.course.findFirst({
    where: { status: 'published' },
    orderBy: { id: 'asc' },
  });

  if (!course) {
    course = await prisma.course.findFirst({ orderBy: { id: 'asc' } });
  }

  if (!course) {
    console.error('❌  No courses found in the database. Run the main seed first.');
    process.exit(1);
  }

  console.log(`📚  Enriching course: "${course.title}" (ID: ${course.id})`);

  // -------------------------------------------------------------------------
  // Clear existing lessons & quizzes for this course (avoid duplicates)
  // -------------------------------------------------------------------------
  await prisma.lessonProgress.deleteMany({
    where: { lesson: { course_id: course.id } },
  });
  await prisma.lessonFile.deleteMany({
    where: { lesson: { course_id: course.id } },
  });
  await prisma.courseLesson.deleteMany({ where: { course_id: course.id } });

  const existingQuizzes = await prisma.courseQuiz.findMany({
    where: { course_id: course.id },
    select: { id: true },
  });
  for (const q of existingQuizzes) {
    const questions = await prisma.quizQuestion.findMany({
      where: { quiz_id: q.id },
      select: { id: true },
    });
    for (const qq of questions) {
      await prisma.quizAnswer.deleteMany({ where: { question_id: qq.id } });
    }
    await prisma.quizQuestion.deleteMany({ where: { quiz_id: q.id } });
    await prisma.quizAttempt.deleteMany({ where: { quiz_id: q.id } });
  }
  await prisma.courseQuiz.deleteMany({ where: { course_id: course.id } });

  console.log('🗑️   Cleared old lessons and quizzes.');

  // -------------------------------------------------------------------------
  // Create modules + lessons
  // -------------------------------------------------------------------------
  let lessonOrder = 1;
  for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
      await prisma.courseLesson.create({
        data: {
          course_id: course.id,
          title: lesson.title,
          content: lessonContent(mod.name, lesson.videoId, lesson.body),
          lesson_order: lessonOrder++,
          duration_minutes: lesson.duration_minutes,
          is_free: lessonOrder <= 2, // first lesson free
        },
      });
    }
    console.log(`  ✅  Module created: ${mod.name} (${mod.lessons.length} lessons)`);
  }

  // -------------------------------------------------------------------------
  // Create quizzes + questions + answers
  // -------------------------------------------------------------------------
  for (const quiz of QUIZZES) {
    const createdQuiz = await prisma.courseQuiz.create({
      data: {
        course_id: course.id,
        title: quiz.title,
        passing_score: quiz.passing_score,
        quiz_order: quiz.quiz_order,
        time_limit: 20,
        max_attempts: 3,
        is_active: true,
      },
    });

    for (const q of quiz.questions) {
      const createdQuestion = await prisma.quizQuestion.create({
        data: {
          quiz_id: createdQuiz.id,
          question_text: q.text,
          question_type: 'multiple_choice',
          points: 1,
          question_order: q.order,
        },
      });

      await prisma.quizAnswer.createMany({
        data: q.answers.map((a) => ({
          question_id: createdQuestion.id,
          answer_text: a.text,
          is_correct: a.correct,
        })),
      });
    }

    console.log(`  ✅  Quiz created: "${quiz.title}" (${quiz.questions.length} questions)`);
  }

  // -------------------------------------------------------------------------
  // Update course duration
  // -------------------------------------------------------------------------
  const totalMinutes = MODULES.flatMap((m) => m.lessons).reduce((s, l) => s + l.duration_minutes, 0);
  await prisma.course.update({
    where: { id: course.id },
    data: { duration_hours: Math.round(totalMinutes / 60) },
  });

  console.log('');
  console.log(`🎉  Done! Course "${course.title}" now has:`);
  console.log(`    • ${MODULES.length} modules`);
  console.log(`    • ${lessonOrder - 1} lessons`);
  console.log(`    • ${QUIZZES.length} quizzes`);
  console.log(`    • ${QUIZZES.reduce((s, q) => s + q.questions.length, 0)} questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
