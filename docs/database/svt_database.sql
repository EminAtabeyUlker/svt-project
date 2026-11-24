-- =====================================================================
-- SE 342 SVT Project - Student-Advisor Meeting and Project Tracking System
-- PostgreSQL database script (Sprint 3)
-- Built from the ERD (5-erd-diagram.png) and requirements FR-01..FR-23,
-- BR-01..BR-08. Run this whole file once in an empty database.
-- =====================================================================

-- ---------- Clean start (lets you run the script again safely) ----------
DROP TABLE IF EXISTS feedback, submission, task, meeting_request, meeting_slot,
                     group_membership, project_group, user_account CASCADE;
DROP TYPE IF EXISTS user_role, task_status, request_status, slot_status, review_decision CASCADE;
DROP FUNCTION IF EXISTS check_group_size() CASCADE;

-- ---------- ENUM types ----------
CREATE TYPE user_role       AS ENUM ('STUDENT', 'ADVISOR', 'ADMIN');
CREATE TYPE task_status     AS ENUM ('TO_DO', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED');
CREATE TYPE request_status  AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE slot_status     AS ENUM ('AVAILABLE', 'BOOKED');
CREATE TYPE review_decision AS ENUM ('APPROVED', 'REVISION_REQUESTED');

-- ---------- USER_ACCOUNT (FR-20, NFR-01, Q-07) ----------
CREATE TABLE user_account (
    user_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,              -- never plain text (NFR-01)
    role          user_role    NOT NULL,
    is_verified   BOOLEAN      NOT NULL DEFAULT FALSE, -- advisor accounts verified by admin (Q-07)
    created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

-- ---------- PROJECT_GROUP (FR-01, FR-03, FR-04, BR-03) ----------
CREATE TABLE project_group (
    group_id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_name          VARCHAR(80)  NOT NULL,
    project_title       VARCHAR(150) NOT NULL CHECK (btrim(project_title) <> ''), -- FR-01: title cannot be empty
    project_description TEXT,
    advisor_id          INT NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT, -- exactly one advisor (BR-03)
    created_at          TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- GROUP_MEMBERSHIP (FR-02, BR-01, BR-02, Q-08) ----------
CREATE TABLE group_membership (
    membership_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id      INT NOT NULL REFERENCES project_group(group_id) ON DELETE RESTRICT,
    student_id    INT NOT NULL REFERENCES user_account(user_id)   ON DELETE RESTRICT,
    joined_at     TIMESTAMP NOT NULL DEFAULT now(),
    left_at       TIMESTAMP NULL,                      -- NULL = active member
    CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- BR-02: a student can have only one ACTIVE membership at a time
CREATE UNIQUE INDEX ux_one_active_group_per_student
    ON group_membership(student_id) WHERE left_at IS NULL;

-- BR-01: a group can have at most 2 active students
CREATE FUNCTION check_group_size() RETURNS trigger AS $$
BEGIN
    IF NEW.left_at IS NULL AND (
        SELECT count(*) FROM group_membership
        WHERE group_id = NEW.group_id AND left_at IS NULL
          AND membership_id IS DISTINCT FROM NEW.membership_id
    ) >= 2 THEN
        RAISE EXCEPTION 'BR-01 violated: group % already has 2 active students (group is full)', NEW.group_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_size
    BEFORE INSERT OR UPDATE ON group_membership
    FOR EACH ROW EXECUTE FUNCTION check_group_size();

-- ---------- MEETING_SLOT (FR-06) ----------
CREATE TABLE meeting_slot (
    slot_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    advisor_id  INT NOT NULL REFERENCES user_account(user_id) ON DELETE RESTRICT,
    start_time  TIMESTAMP NOT NULL,
    end_time    TIMESTAMP NOT NULL,
    slot_status slot_status NOT NULL DEFAULT 'AVAILABLE',
    CHECK (end_time > start_time)                      -- FR-06: end after start
);

-- ---------- MEETING_REQUEST (FR-07..FR-10, BR-04) ----------
CREATE TABLE meeting_request (
    request_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slot_id        INT NOT NULL REFERENCES meeting_slot(slot_id)   ON DELETE RESTRICT,
    group_id       INT NOT NULL REFERENCES project_group(group_id) ON DELETE RESTRICT,
    request_status request_status NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    decided_at     TIMESTAMP NULL
);

-- BR-04: a slot can have at most one APPROVED request
CREATE UNIQUE INDEX ux_one_approved_request_per_slot
    ON meeting_request(slot_id) WHERE request_status = 'APPROVED';

-- ---------- TASK (FR-11..FR-14) ----------
CREATE TABLE task (
    task_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    group_id    INT NOT NULL REFERENCES project_group(group_id) ON DELETE RESTRICT,
    title       VARCHAR(150) NOT NULL,
    description TEXT NOT NULL CHECK (btrim(description) <> ''), -- FR-11: description mandatory
    due_date    TIMESTAMP NOT NULL,                              -- FR-11: due date mandatory
    task_status task_status NOT NULL DEFAULT 'TO_DO',
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ---------- SUBMISSION (FR-15, FR-18, FR-19, BR-06, Q-03, Q-04) ----------
CREATE TABLE submission (
    submission_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id       INT NOT NULL REFERENCES task(task_id)              ON DELETE RESTRICT,
    uploaded_by   INT NOT NULL REFERENCES user_account(user_id)      ON DELETE RESTRICT,
    version_no    INT NOT NULL CHECK (version_no >= 1),
    file_name     VARCHAR(255) NOT NULL,
    file_type     VARCHAR(10)  NOT NULL CHECK (file_type IN ('PDF', 'DOCX', 'ZIP')),   -- Q-04 assumption
    file_size_kb  INT NOT NULL CHECK (file_size_kb > 0 AND file_size_kb <= 20480),     -- max 20 MB
    submitted_at  TIMESTAMP NOT NULL DEFAULT now(),
    is_late       BOOLEAN   NOT NULL DEFAULT FALSE,
    UNIQUE (task_id, version_no)                       -- FR-18: each re-upload is a new version
);

-- ---------- FEEDBACK (FR-16, FR-17, BR-07) ----------
CREATE TABLE feedback (
    feedback_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    submission_id INT NOT NULL REFERENCES submission(submission_id) ON DELETE RESTRICT,
    advisor_id    INT NOT NULL REFERENCES user_account(user_id)     ON DELETE RESTRICT,
    decision      review_decision NOT NULL,
    comment       TEXT,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    -- BR-07: a revision request must have a comment
    CHECK (decision = 'APPROVED' OR (comment IS NOT NULL AND btrim(comment) <> ''))
);

-- =====================================================================
-- SAMPLE DATA
-- =====================================================================
INSERT INTO user_account (full_name, email, password_hash, role, is_verified) VALUES
 ('System Admin',      'admin@maltepe.edu.tr',       '$2b$12$adminhashexample',   'ADMIN',   TRUE),   -- 1
 ('Dr. Ayse Kaya',     'ayse.kaya@maltepe.edu.tr',   '$2b$12$advisorhash1example','ADVISOR', TRUE),   -- 2
 ('Dr. Mehmet Demir',  'mehmet.demir@maltepe.edu.tr','$2b$12$advisorhash2example','ADVISOR', TRUE),   -- 3
 ('Elif Yilmaz',       'elif.yilmaz@std.maltepe.edu.tr', '$2b$12$studenthash1',   'STUDENT', TRUE),   -- 4
 ('Can Arslan',        'can.arslan@std.maltepe.edu.tr',  '$2b$12$studenthash2',   'STUDENT', TRUE),   -- 5
 ('Zeynep Sahin',      'zeynep.sahin@std.maltepe.edu.tr','$2b$12$studenthash3',   'STUDENT', TRUE),   -- 6
 ('Burak Celik',       'burak.celik@std.maltepe.edu.tr', '$2b$12$studenthash4',   'STUDENT', TRUE);   -- 7

INSERT INTO project_group (group_name, project_title, project_description, advisor_id) VALUES
 ('Group Alpha', 'Smart Campus Parking',   'Mobile app that shows free parking spots on campus.', 2),
 ('Group Beta',  'Library Seat Booking',   'Web system for booking study seats in the library.',  3);

INSERT INTO group_membership (group_id, student_id) VALUES
 (1, 4), (1, 5),     -- Group Alpha: Elif, Can
 (2, 6);             -- Group Beta: Zeynep (one free place left)

INSERT INTO meeting_slot (advisor_id, start_time, end_time, slot_status) VALUES
 (2, '2026-11-12 10:00', '2026-11-12 10:30', 'BOOKED'),
 (2, '2026-11-12 10:30', '2026-11-12 11:00', 'AVAILABLE'),
 (3, '2026-11-13 14:00', '2026-11-13 14:30', 'AVAILABLE');

INSERT INTO meeting_request (slot_id, group_id, request_status, decided_at) VALUES
 (1, 1, 'APPROVED', '2026-11-05 09:15'),
 (3, 2, 'PENDING',  NULL);

INSERT INTO task (group_id, title, description, due_date, task_status) VALUES
 (1, 'Requirements document', 'Write the first version of the requirements document.', '2026-11-08 23:59', 'SUBMITTED'),   -- revised version uploaded, waiting for review (FR-18)
 (1, 'UI mockups',            'Prepare mockups of the main screens.',                    '2026-11-20 23:59', 'IN_PROGRESS'),
 (2, 'Project proposal',      'Submit a one page project proposal.',                     '2026-11-06 23:59', 'APPROVED');

INSERT INTO submission (task_id, uploaded_by, version_no, file_name, file_type, file_size_kb, submitted_at, is_late) VALUES
 (1, 4, 1, 'requirements_v1.pdf', 'PDF',  850, '2026-11-07 18:20', FALSE),
 (1, 5, 2, 'requirements_v2.pdf', 'PDF',  910, '2026-11-09 21:05', TRUE),   -- uploaded after due date (Q-03)
 (3, 6, 1, 'proposal.docx',       'DOCX', 120, '2026-11-05 12:00', FALSE);

INSERT INTO feedback (submission_id, advisor_id, decision, comment) VALUES
 (1, 2, 'REVISION_REQUESTED', 'Please add non-functional requirements and use case descriptions.'),
 (3, 3, 'APPROVED',           'Clear and well scoped. Approved.');

-- =====================================================================
-- CHECK: one overview query to show the database works
-- =====================================================================
SELECT g.group_name,
       g.project_title,
       a.full_name                          AS advisor,
       string_agg(DISTINCT s.full_name, ', ') AS students,
       count(DISTINCT t.task_id)            AS tasks,
       count(DISTINCT sub.submission_id)    AS submissions
FROM project_group g
JOIN user_account a          ON a.user_id = g.advisor_id
LEFT JOIN group_membership m ON m.group_id = g.group_id AND m.left_at IS NULL
LEFT JOIN user_account s     ON s.user_id = m.student_id
LEFT JOIN task t             ON t.group_id = g.group_id
LEFT JOIN submission sub     ON sub.task_id = t.task_id
GROUP BY g.group_id, g.group_name, g.project_title, a.full_name
ORDER BY g.group_id;
