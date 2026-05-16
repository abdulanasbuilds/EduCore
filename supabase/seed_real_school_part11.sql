-- ==========================================
-- 26. BEHAVIOR CATEGORIES (4)
-- ==========================================
INSERT INTO behavior_categories (id, school_id, name, type, severity, notify_parent)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Excellent', 'positive', 3, false),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Good Conduct', 'positive', 2, false),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Minor Infraction', 'negative', 1, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Serious Infraction', 'negative', 3, true);

-- ==========================================
-- 27. BEHAVIOR LOGS (6: 3 positive, 3 negative)
-- ==========================================
INSERT INTO behavior_logs (id, school_id, student_id, category_id, description, type, severity, date, logged_by, parent_notified, notification_sent_at)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's1a2b3c4-d5e6-7890-fabc-456789012350', (SELECT id FROM behavior_categories WHERE name = 'Excellent' LIMIT 1), 'Top score in Math Class Test - demonstrated exceptional problem-solving skills', 'positive', 3, '2025-01-28', 'f2a3b4c5-d5e6-7890-fabc-456789012346', false, NULL),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000010', (SELECT id FROM behavior_categories WHERE name = 'Good Conduct' LIMIT 1), 'Helped organize classroom materials without being asked', 'positive', 2, '2025-01-30', 'f2a3b4c5-d5e6-7890-fabc-456789012346', false, NULL),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000019', (SELECT id FROM behavior_categories WHERE name = 'Good Conduct' LIMIT 1), 'Assisted a fellow student who was struggling with classwork', 'positive', 2, '2025-02-03', 'f3a4b5c6-d5e6-7890-fabc-456789012347', false, NULL),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000011', (SELECT id FROM behavior_categories WHERE name = 'Minor Infraction' LIMIT 1), 'Disrupted class by talking during lesson after multiple warnings', 'negative', 1, '2025-02-05', 'f2a3b4c5-d5e6-7890-fabc-456789012346', true, '2025-02-05 15:30:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000021', (SELECT id FROM behavior_categories WHERE name = 'Minor Infraction' LIMIT 1), 'Failed to complete homework for the third time this term', 'negative', 1, '2025-02-07', 'f3a4b5c6-d5e6-7890-fabc-456789012347', true, '2025-02-07 15:30:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000025', (SELECT id FROM behavior_categories WHERE name = 'Minor Infraction' LIMIT 1), 'Caught using mobile phone during school hours', 'negative', 1, '2025-02-10', 'f3a4b5c6-d5e6-7890-fabc-456789012347', true, '2025-02-10 16:00:00+00');

-- ==========================================
-- 28. EXPENSE CATEGORIES (4)
-- ==========================================
INSERT INTO expense_categories (id, school_id, name)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maintenance'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Supplies'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Utilities'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Transport');

-- ==========================================
-- 29. EXPENSES (5)
-- ==========================================
INSERT INTO expenses (id, school_id, category_id, description, amount, expense_date, payment_method, reference, recorded_by)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Maintenance' LIMIT 1), 'Classroom desk and chair repairs', 1500, '2025-01-20', 'cash', 'EXP-2025-001', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Supplies' LIMIT 1), 'Office stationery and supplies', 800, '2025-01-25', 'cash', 'EXP-2025-002', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Utilities' LIMIT 1), 'Electricity bill - January 2025', 2500, '2025-02-05', 'bank_transfer', 'EXP-2025-003', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Transport' LIMIT 1), 'School bus fuel for February', 1200, '2025-02-10', 'cash', 'EXP-2025-004', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Maintenance' LIMIT 1), 'Plumbing repairs - boys washroom', 2000, '2025-02-15', 'momo', 'EXP-2025-005', 'f4a5b6c7-d5e6-7890-fabc-456789012348');

-- ==========================================
-- 30. STAFF ATTENDANCE (10 records)
-- ==========================================
INSERT INTO staff_attendance (id, school_id, staff_id, date, status, arrival_time, marked_by)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', '2025-02-03', 'present', '07:15:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '2025-02-03', 'present', '07:25:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '2025-02-04', 'present', '07:20:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '2025-02-04', 'late', '08:10:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', '2025-02-05', 'present', '07:10:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f4a5b6c7-d5e6-7890-fabc-456789012348', '2025-02-05', 'present', '07:30:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '2025-02-06', 'present', '07:30:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '2025-02-06', 'absent', NULL, 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', '2025-02-07', 'late', '08:00:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f4a5b6c7-d5e6-7890-fabc-456789012348', '2025-02-07', 'present', '07:20:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345');

-- ==========================================
-- 31. ADMISSION APPLICATIONS (3)
-- ==========================================
INSERT INTO admission_applications (id, student_full_name, date_of_birth, gender, class_applied_name, parent_full_name, parent_relationship, parent_phone, parent_email, home_address, status, admin_notes)
VALUES
(gen_random_uuid(), 'Emmanuel Osei', '2018-06-15', 'Male', 'Basic 1', 'Mr. Kwame Osei', 'Father', '+233244200001', 'kwame.osei@email.com', '15 Liberation Road, Accra', 'pending', 'Awaiting document verification'),
(gen_random_uuid(), 'Mabel Asante', '2016-03-22', 'Female', 'Basic 3', 'Mrs. Efua Asante', 'Mother', '+233244200002', 'efua.asante@email.com', '42 Independence Ave, Accra', 'approved', 'All documents verified. Approved for admission.'),
(gen_random_uuid(), 'Ernest Kofi', '2012-09-10', 'Male', 'JHS 1', 'Mr. Yaw Kofi', 'Father', '+233244200003', 'yaw.kofi@email.com', '7 Castle Road, Accra', 'rejected', 'Application incomplete. Required documents not submitted within deadline.');

-- ==========================================
-- 32. NOTIFICATION LOGS (5)
-- ==========================================
INSERT INTO notification_logs (id, school_id, recipient_phone, recipient_name, channel, type, message_body, status, sent_at)
VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+233244100001', 'Mr. Yaw Frimpong', 'sms', 'attendance_alert', 'Your ward Kwesi Agyemang was marked Late on 5th Feb 2025. Please ensure punctuality.', 'sent', '2025-02-05 10:30:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+233244100002', 'Mrs. Akua Mensah', 'whatsapp', 'fee_reminder', 'Dear Parent, this is a reminder that Term 1 fees are due by 15th Feb 2025. Please make payment to avoid disruption.', 'sent', '2025-02-01 09:00:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+233244100007', 'Mr. Kwesi Baah', 'sms', 'event_notification', 'You are invited to the PTA Meeting on 20th Feb 2025 at 3:00 PM. Venue: School Auditorium.', 'sent', '2025-02-10 14:00:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+233244100013', 'Mr. Kwame Forson', 'email', 'results_notification', 'Dear Parent, your ward''s mid-term results are now available on the parent portal. Please log in to view.', 'failed', '2025-02-20 12:00:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '+233244100014', 'Mr. Yaw Mensah', 'whatsapp', 'general_announcement', 'School will be closed for mid-term break from 10th to 14th March 2025. School resumes 17th March.', 'sent', '2025-03-05 08:00:00+00');

-- ==========================================
-- 33. TIME SLOTS (8)
-- ==========================================
INSERT INTO time_slots (id, school_id, name, start_time, end_time) VALUES
('00000031-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 1', '07:30:00', '08:10:00'),
('00000031-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 2', '08:10:00', '08:50:00'),
('00000031-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 3', '08:50:00', '09:30:00'),
('00000031-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 4', '10:00:00', '10:40:00'),
('00000031-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 5', '10:40:00', '11:20:00'),
('00000031-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 6', '11:20:00', '12:00:00'),
('00000031-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 7', '12:00:00', '12:40:00'),
('00000031-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Period 8', '13:00:00', '13:40:00');

-- ==========================================
-- 34. TIMETABLES (Basic 4 + JHS 1, Mon-Fri, 6 periods/day)
-- Periods 1-6 used, Periods 7-8 reserved
-- ==========================================
-- Basic 4 Monday (day_of_week=1)
INSERT INTO timetables (id, school_id, class_id, subject_id, teacher_id, time_slot_id, day_of_week, room, academic_year_id) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000001', 1, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000002', 1, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000003', 1, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000004', 1, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000005', 1, 'ICT Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000006', 1, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- Basic 4 Tuesday (day_of_week=2)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000001', 2, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000002', 2, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000003', 2, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b1-c5d6-7890-efab-345678901241', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000004', 2, 'Art Rm', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e2f3a4c1-c5d6-7890-efab-345678901244', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000005', 2, 'Field', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b3-c5d6-7890-efab-345678901243', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000006', 2, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- Basic 4 Wednesday (day_of_week=3)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000001', 3, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000002', 3, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000003', 3, 'Sci Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b2-c5d6-7890-efab-345678901242', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000004', 3, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e2f3a4c5-c5d6-7890-efab-345678901245', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000005', 3, 'Workshop', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000006', 3, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- Basic 4 Thursday (day_of_week=4)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000001', 4, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000002', 4, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000003', 4, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b1-c5d6-7890-efab-345678901241', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000004', 4, 'Art Rm', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b3-c5d6-7890-efab-345678901243', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000005', 4, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e2f3a4c1-c5d6-7890-efab-345678901244', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000006', 4, 'Field', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- Basic 4 Friday (day_of_week=5)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000001', 5, 'Sci Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000002', 5, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000003', 5, 'ICT Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b2-c5d6-7890-efab-345678901242', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000004', 5, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e2f3a4c5-c5d6-7890-efab-345678901245', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000005', 5, 'Workshop', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '00000031-0000-0000-0000-000000000006', 5, 'Rm 101', 'b1c2d3e4-f5a6-7890-bcde-f12345678901');

-- JHS 1 Monday (day_of_week=1)
INSERT INTO timetables (id, school_id, class_id, subject_id, teacher_id, time_slot_id, day_of_week, room, academic_year_id) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000001', 1, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000002', 1, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000003', 1, 'Sci Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000004', 1, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000005', 1, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000006', 1, 'ICT Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- JHS 1 Tuesday (day_of_week=2)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000001', 2, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000002', 2, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000003', 2, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b1-c5d6-7890-efab-345678901241', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000004', 2, 'Art Rm', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e2f3a4c1-c5d6-7890-efab-345678901244', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000005', 2, 'Field', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b3-c5d6-7890-efab-345678901243', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000006', 2, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- JHS 1 Wednesday (day_of_week=3)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000001', 3, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000002', 3, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000003', 3, 'Sci Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b2-c5d6-7890-efab-345678901242', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000004', 3, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e2f3a4c5-c5d6-7890-efab-345678901245', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000005', 3, 'Workshop', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000006', 3, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- JHS 1 Thursday (day_of_week=4)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000001', 4, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000002', 4, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000003', 4, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b1-c5d6-7890-efab-345678901241', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000004', 4, 'Art Rm', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b3-c5d6-7890-efab-345678901243', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000005', 4, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e2f3a4c1-c5d6-7890-efab-345678901244', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000006', 4, 'Field', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
-- JHS 1 Friday (day_of_week=5)
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000001', 5, 'Sci Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000002', 5, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000003', 5, 'ICT Lab', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b2-c5d6-7890-efab-345678901242', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000004', 5, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e2f3a4c5-c5d6-7890-efab-345678901245', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000005', 5, 'Workshop', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '00000031-0000-0000-0000-000000000006', 5, 'Rm 201', 'b1c2d3e4-f5a6-7890-bcde-f12345678901');
