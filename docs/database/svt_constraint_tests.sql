-- =====================================================================
-- SE 342 SVT Project - database constraint tests
-- Run AFTER svt_database.sql, in the order below (1 to 8). Select ONE test (one statement) and run it
-- with F5. Each "should FAIL" test must end with an ERROR message; that
-- error is the proof that the business rule is enforced.
-- =====================================================================

-- TEST 1 (BR-01) should FAIL: Group Alpha already has 2 students
INSERT INTO group_membership (group_id, student_id) VALUES (1, 7);

-- TEST 2 (BR-02) should FAIL: Elif is already active in Group Alpha
INSERT INTO group_membership (group_id, student_id) VALUES (2, 4);

-- TEST 3 (BR-04) should FAIL: slot 1 already has an approved request
INSERT INTO meeting_request (slot_id, group_id, request_status) VALUES (1, 2, 'APPROVED');

-- TEST 4 (BR-07) should FAIL: revision request without a comment
INSERT INTO feedback (submission_id, advisor_id, decision, comment) VALUES (2, 2, 'REVISION_REQUESTED', '');

-- TEST 5 (FR-11) should FAIL: task without a description
INSERT INTO task (group_id, title, description, due_date) VALUES (1, 'Empty task', '', '2026-12-01');

-- TEST 6 (FR-15 / Q-04) should FAIL: .exe file is not an allowed type
INSERT INTO submission (task_id, uploaded_by, version_no, file_name, file_type, file_size_kb)
VALUES (2, 4, 1, 'virus.exe', 'EXE', 100);

-- TEST 7 (BR-06) should FAIL: a user who has group, submission or feedback records cannot be deleted
DELETE FROM user_account WHERE user_id = 4;

-- TEST 8 (BR-02 valid case) should SUCCEED: Burak joins Group Beta (2nd member)
INSERT INTO group_membership (group_id, student_id) VALUES (2, 7);
