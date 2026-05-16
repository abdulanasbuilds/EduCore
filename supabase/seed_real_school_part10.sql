-- ==========================================
-- 21. ANNOUNCEMENTS (3)
-- ==========================================
INSERT INTO announcements (id, school_id, created_by, title, body, target, send_sms, send_whatsapp, recipient_count, delivered_count, failed_count, channels)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', 'Welcome Back to School - 2025 Academic Year', 'Dear parents and guardians, we are excited to welcome all students back for the 2024/2025 academic year. Classes commence on Monday, 13th January 2025. Please ensure your wards are fully prepared with all required learning materials.', 'all', true, true, 450, 440, 10, ARRAY['sms', 'whatsapp']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', 'PTA Meeting Scheduled for February 20th', 'This is to inform all parents that the first PTA meeting of the year will be held on Thursday, 20th February 2025 at 3:00 PM in the school auditorium. Attendance is mandatory for at least one parent per family.', 'all', true, false, 450, 430, 20, ARRAY['sms']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', 'Mid-Term Break Notice', 'Please be informed that the school will observe a mid-term break from Monday, 10th March to Friday, 14th March 2025. School resumes on Monday, 17th March 2025. Enjoy the break.', 'all', true, true, 450, 445, 5, ARRAY['sms', 'whatsapp']);

-- ==========================================
-- 22. SCHOOL EVENTS (5)
-- ==========================================
INSERT INTO school_events (id, school_id, title, description, event_date, start_time, end_time, location, event_type, target, created_by)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Opening Ceremony', 'Official opening ceremony for the 2024/2025 academic year', '2025-01-13', '08:00:00', '10:00:00', 'School Assembly Hall', 'general', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'First PTA Meeting', 'Annual general meeting of the Parent-Teacher Association', '2025-02-20', '15:00:00', '17:00:00', 'School Auditorium', 'pta', 'parents', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Inter-House Sports Day', 'Annual sports competition among the four houses', '2025-03-15', '07:00:00', '16:00:00', 'School Sports Complex', 'sports', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cultural Day Celebration', 'Celebration of Ghanaian culture with performances, food, and displays', '2025-04-05', '09:00:00', '15:00:00', 'School Premises', 'cultural', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'End of Term Awards Ceremony', 'Recognition of outstanding students for Term 1', '2025-04-11', '09:00:00', '12:00:00', 'School Assembly Hall', 'general', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345');

-- ==========================================
-- 23. BOOKS (10)
-- ==========================================
INSERT INTO books (id, school_id, title, author, isbn, category, total_copies, available_copies)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mathematics for Basic Schools 4', 'Adjei Mensah', '978-9988-0-1234-1', 'Mathematics', 15, 12),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Integrated Science for Primary', 'Kofi Annan', '978-9988-0-1234-2', 'Science', 12, 10),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'English Language for Basic 4', 'Ghana Education Service', '978-9988-0-1234-3', 'English', 20, 17),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Social Studies for Ghana', 'Ministry of Education', '978-9988-0-1234-4', 'Social Studies', 10, 9),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Twi for Beginners', 'Akua Sarpong', '978-9988-0-1234-5', 'Language', 8, 7),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ICT for Basic Schools', 'Kwame Nkrumah', '978-9988-0-1234-6', 'Technology', 10, 8),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Our World Our People', 'GES Curriculum', '978-9988-0-1234-7', 'Social Studies', 10, 10),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Religious & Moral Education', 'GES Publications', '978-9988-0-1234-8', 'RME', 10, 9),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Creative Arts for Primary', 'Ministry of Education', '978-9988-0-1234-9', 'Arts', 8, 7),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Physical Education Guide', 'Sports Council Ghana', '978-9988-0-1235-0', 'PE', 6, 6);

-- ==========================================
-- 24. BOOK ISSUES (5)
-- ==========================================
INSERT INTO book_issues (id, book_id, student_id, issued_on, due_date, returned_on, status, issued_by)
VALUES
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'Mathematics for Basic Schools 4' LIMIT 1), 's0000001-0000-0000-0000-000000000001', '2025-01-15', '2025-02-15', '2025-02-10', 'returned', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'Integrated Science for Primary' LIMIT 1), 's0000001-0000-0000-0000-000000000004', '2025-01-20', '2025-02-20', '2025-02-15', 'returned', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'English Language for Basic 4' LIMIT 1), 's0000001-0000-0000-0000-000000000010', '2025-02-01', '2025-03-01', NULL, 'issued', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'Social Studies for Ghana' LIMIT 1), 's0000001-0000-0000-0000-000000000019', '2025-02-05', '2025-03-05', NULL, 'issued', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'ICT for Basic Schools' LIMIT 1), 's0000001-0000-0000-0000-000000000013', '2025-01-25', '2025-02-25', '2025-02-20', 'returned', 'f1a2b3c4-d5e6-7890-fabc-456789012345');

-- ==========================================
-- 25. ASSIGNMENTS (8)
-- ==========================================
INSERT INTO assignments (id, school_id, class_id, subject_id, teacher_id, title, description, due_date, max_score, is_published)
VALUES
-- Basic 4 assignments (teacher1)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'B4 Math Homework 1 - Fractions', 'Solve the fraction problems on pages 24-28 of your textbook.', '2025-02-07 23:59:59+00', 100, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'B4 English Essay - My School', 'Write a 250-word essay describing your school and what you like most about it.', '2025-02-14 23:59:59+00', 100, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'B4 Science Project - Plant Growth', 'Observe and document the growth of a bean plant over 2 weeks. Submit your observations.', '2025-03-01 23:59:59+00', 100, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'B4 ICT Task - Typing Practice', 'Practice touch typing for 30 minutes daily and submit your speed test results.', '2025-02-28 23:59:59+00', 100, false),
-- JHS 1 assignments (teacher2)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'J1 Math Assignment - Algebra', 'Solve the algebraic equations in Chapter 3, questions 1-20.', '2025-02-10 23:59:59+00', 100, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'J1 English Comprehension', 'Read the passage on page 45 and answer all comprehension questions.', '2025-02-17 23:59:59+00', 100, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'J1 Science Lab Report', 'Write a lab report on the acid-base titration experiment conducted in class.', '2025-03-05 23:59:59+00', 100, false),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'J1 Social Studies Project', 'Research and present on the cultural practices of any one ethnic group in Ghana.', '2025-03-10 23:59:59+00', 100, true);
