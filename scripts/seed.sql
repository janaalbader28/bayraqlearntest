-- 1. Create Admin User (password is 'admin123' bcrypt hashed)
-- $2a$10$tM.yF6A8R6K.sE0A9NqWNuA5Z.1P1J8K.sE0A9NqWNuA5Z.1P1J8 (Wait, I'll use a more standard one)
-- Let's use the one from the original SQL if possible or a known one.
-- admin / admin123 -> $2a$10$G0m9.K8I0l8u7u5l7l7l7u5l7l7l7u5l7l7l7u5l7l7l7u5l7l7
-- Actually, I'll just insert a student first to test.

-- Since I can't easily generate BCrypt in SQL, I'll insert the courses first.

-- 2. Insert Courses
INSERT INTO `courses` (`title`, `description`, `short_description`, `instructor_name`, `category`, `level`, `price`, `duration_hours`, `status`, `enrollment_count`, `rating`, `created_at`, `updated_at`) VALUES
('Advanced Malware Analysis & Reverse Engineering', 'Deep-dive into zero-day malware behavior and binary exploitation. This module covers the full spectrum of malware analysis, from static analysis of PE files to dynamic debugging using x64dbg and IDA Pro. Learn how to dismantle sophisticated ransomware and extract C2 server intel.', 'Deep-dive into zero-day malware behavior and binary exploitation.', 'Dr. Binary', 'Offensive Cybersecurity', 'advanced', 2500.00, 45, 'published', 0, 4.9, NOW(), NOW()),
('SOC Analyst L1: Threat Hunting Operations', 'Transition into a professional SOC Analyst role. Learn incident response protocols, log analysis with ELK stack, and how to identify lateral movement in real-time.', 'Master the art of defending enterprise networks using modern SIEM tools.', 'Command Shield', 'Defensive Cybersecurity', 'beginner', 1200.00, 32, 'published', 0, 4.7, NOW(), NOW()),
('Ethical Hacking: Pentesting Enterprise Active Directory', 'Active Directory is the heart of the enterprise. This course teaches you how to compromise domains from the outside-in, covering Kerberoasting, Bloodhound analysis, and Golden Ticket attacks.', 'Exploiting AD environments using modern attack vectors like Refined Relay.', 'Ghost Operator', 'Offensive Cybersecurity', 'intermediate', 1800.00, 40, 'published', 0, 4.8, NOW(), NOW());

-- 3. Insert Lessons for the first course
SET @course_id = (SELECT id FROM courses LIMIT 1);
INSERT INTO `course_lessons` (`course_id`, `title`, `content`, `lesson_order`, `duration_minutes`, `is_free`, `created_at`, `updated_at`) VALUES
(@course_id, 'Mission Briefing & Environment Setup', 'In this phase, we establish the tactical baseline. You will deploy the lab environment and verify all security protocols.', 1, 20, 1, NOW(), NOW()),
(@course_id, 'Core Methodology & Logic Analysis', 'Here we analyze the system logic and identify potential entry points or defense gaps. Follow the established framework.', 2, 45, 0, NOW(), NOW()),
(@course_id, 'Final Operational Engagement', 'The execution phase. Apply all analyzed data points to perform the final tactical maneuver. Documentation is mandatory.', 3, 60, 0, NOW(), NOW());
