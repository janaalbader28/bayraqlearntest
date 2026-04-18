import { PrismaClient, type CourseStatus, type Level } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Initializing BayraqLearn Academy ---');

    // 1. Create Admin (password: Admin123!)
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.upsert({
        where: { email: 'admin@bayraqlearn.com' },
        update: {
            password: adminPassword,
            role: 'admin',
            is_active: true,
            is_verified: true,
        },
        create: {
            username: 'admin_officer',
            email: 'admin@bayraqlearn.com',
            password: adminPassword,
            role: 'admin',
            is_active: true,
            is_verified: true,
        },
    });
    console.log('✅ Admin: admin@bayraqlearn.com / Admin123!');

    // 2. Create Courses
    const courses: Array<{
        title: string;
        short_description: string;
        description: string;
        instructor_name: string;
        category: string;
        level: Level;
        price: number;
        duration_hours: number;
        status: CourseStatus;
    }> = [
        {
            title: 'Advanced Malware Analysis & Reverse Engineering',
            short_description: 'Deep-dive into zero-day malware behavior and binary exploitation.',
            description: 'This module covers the full spectrum of malware analysis, from static analysis of PE files to dynamic debugging using x64dbg and IDA Pro. Learn how to dismantle sophisticated ransomware and extract C2 server intel.',
            instructor_name: 'Dr. Binary',
            category: 'Offensive Cybersecurity',
            level: 'advanced',
            price: 2500,
            duration_hours: 45,
            status: 'published',
        },
        {
            title: 'SOC Analyst L1: Threat Hunting Operations',
            short_description: 'Master the art of defending enterprise networks using modern SIEM tools.',
            description: 'Transition into a professional SOC Analyst role. Learn incident response protocols, log analysis with ELK stack, and how to identify lateral movement in real-time.',
            instructor_name: 'Command Shield',
            category: 'Defensive Cybersecurity',
            level: 'beginner',
            price: 1200,
            duration_hours: 32,
            status: 'published',
        },
        {
            title: 'Ethical Hacking: Pentesting Enterprise Active Directory',
            short_description: 'Exploiting AD environments using modern attack vectors like Refined Relay.',
            description: 'Active Directory is the heart of the enterprise. This course teaches you how to compromise domains from the outside-in, covering Kerberoasting, Bloodhound analysis, and Golden Ticket attacks.',
            instructor_name: 'Ghost Operator',
            category: 'Offensive Cybersecurity',
            level: 'intermediate',
            price: 1800,
            duration_hours: 40,
            status: 'published',
        },
    ];

    for (const cData of courses) {
        const course = await prisma.course.create({
            data: cData,
        });
        console.log(`✅ Module Deployed: ${course.title}`);

        // Add 3 mock lessons to each course
        await prisma.courseLesson.createMany({
            data: [
                {
                    course_id: course.id,
                    title: 'Mission Briefing & Environment Setup',
                    content: 'In this phase, we establish the tactical baseline. You will deploy the lab environment and verify all security protocols.',
                    lesson_order: 1,
                    duration_minutes: 20,
                    is_free: true,
                },
                {
                    course_id: course.id,
                    title: 'Core Methodology & Logic Analysis',
                    content: 'Here we analyze the system logic and identify potential entry points or defense gaps. Follow the established framework.',
                    lesson_order: 2,
                    duration_minutes: 45,
                    is_free: false,
                },
                {
                    course_id: course.id,
                    title: 'Final Operational Engagement',
                    content: 'The execution phase. Apply all analyzed data points to perform the final tactical maneuver. Documentation is mandatory.',
                    lesson_order: 3,
                    duration_minutes: 60,
                    is_free: false,
                },
            ],
        });
    }

    console.log('--- Intelligence Deployment Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
