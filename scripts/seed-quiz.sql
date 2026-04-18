-- 1. Create a Quiz for the first course
SET @course_id = (SELECT id FROM courses LIMIT 1);
INSERT INTO `course_quizzes` (`course_id`, `title`, `description`, `passing_score`, `time_limit`, `max_attempts`, `quiz_order`, `is_active`, `created_at`, `updated_at`) VALUES
(@course_id, 'Phases of Malware Analysis: Tactical Evaluation', 'Verify your understanding of static and dynamic analysis methodologies.', 80, 20, 3, 1, 1, NOW(), NOW());

SET @quiz_id = LAST_INSERT_ID();

-- 2. Create Questions
INSERT INTO `quiz_questions` (`quiz_id`, `question_text`, `question_type`, `points`, `question_order`, `created_at`) VALUES
(@quiz_id, 'Which of the following is considered a "Static Analysis" technique?', 'multiple_choice', 10, 1, NOW()),
(@quiz_id, 'What is the primary purpose of a "Sandbox" environment in malware analysis?', 'multiple_choice', 10, 2, NOW()),
(@quiz_id, 'Which tool is primarily used for binary reverse engineering and disassembly?', 'multiple_choice', 10, 3, NOW());

-- 3. Create Answers
SET @q1_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz_id AND question_order = 1 LIMIT 1);
INSERT INTO `quiz_answers` (`question_id`, `answer_text`, `is_correct`, `created_at`) VALUES
(@q1_id, 'Running the malware in a debugger', 0, NOW()),
(@q1_id, 'Analyzing the PE header and string extraction', 1, NOW()),
(@q1_id, 'Monitoring network traffic during execution', 0, NOW()),
(@q1_id, 'Memory forensics of a live system', 0, NOW());

SET @q2_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz_id AND question_order = 2 LIMIT 1);
INSERT INTO `quiz_answers` (`question_id`, `answer_text`, `is_correct`, `created_at`) VALUES
(@q2_id, 'To speed up the execution of the malware', 0, NOW()),
(@q2_id, 'To safely execute malware in an isolated system', 1, NOW()),
(@q2_id, 'To encrypt the malware files', 0, NOW()),
(@q2_id, 'To distribute the malware to multiple targets', 0, NOW());

SET @q3_id = (SELECT id FROM quiz_questions WHERE quiz_id = @quiz_id AND question_order = 3 LIMIT 1);
INSERT INTO `quiz_answers` (`question_id`, `answer_text`, `is_correct`, `created_at`) VALUES
(@q3_id, 'Wireshark', 0, NOW()),
(@q3_id, 'IDA Pro', 1, NOW()),
(@q3_id, 'Nmap', 0, NOW()),
(@q3_id, 'Metasploit', 0, NOW());
