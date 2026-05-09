-- =============================================
-- ElevateHub Outplacement Tracker — SQL Export
-- Generated: 2026-05-07T22:13:59.537Z
-- =============================================

-- ----------------------------
-- Table: users
-- ----------------------------
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'team_member',
  disabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT
);

INSERT INTO users (id, name, email, phone, password, role, disabled, created_at) VALUES ('usr_admin_001', 'Ashwin', 'ashwin@elevate.com', '', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 0, '2026-01-01T00:00:00.000Z');
INSERT INTO users (id, name, email, phone, password, role, disabled, created_at) VALUES ('usr_c7386a2d', 'Ashwin Noronha ', 'ashwin@global-dubai.com', '', '$2a$10$oWMDJDwi1KklNQfWJsxXEuTeP5rn/0pHK0rIuB5nTs4DJLKa7OZQK', 'team_member', 0, '2026-05-06T06:24:51.343Z');

-- ----------------------------
-- Table: candidates
-- ----------------------------
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'referred',
  partner TEXT,
  client_name TEXT,
  candidate_name TEXT NOT NULL,
  level_of_support TEXT,
  lead_coach TEXT,
  support TEXT,
  email TEXT,
  whatsapp TEXT,
  linkedin TEXT,
  duration TEXT,
  date_started TEXT,
  end_date TEXT,
  sessions_completed INTEGER DEFAULT 0,
  notes TEXT,
  disc_style TEXT,
  disc_done TEXT DEFAULT 'Not Done',
  job_status TEXT,
  new_company TEXT,
  new_placement TEXT,
  position TEXT,
  sector TEXT,
  old_placement TEXT,
  invoice_status TEXT DEFAULT 'Not Raised',
  costing_status TEXT DEFAULT 'Not Done',
  created_at TEXT,
  updated_at TEXT,
  updated_by TEXT
);

INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_001', 'referred', 'Challenger Grey', 'Talogy', 'Joanna Rodrigues', 'Mid-High', 'Saima', 'Celeste', 'joanna_0509@yahoo.co.in', '', 'https://www.linkedin.com/in/joanna-rodrigues-32b8a2116', '3 Months (8 Sessions)', '2026-03-09', NULL, 3, 'Waiting for her to send in her updated CV and LinkedIn, will then have the DiSC session.', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-03-09T00:00:00.000Z', '2026-05-07T22:01:10.440Z', 'usr_c7386a2d');
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_002', 'active', 'Challenger Grey', 'University Support', 'Rachael Phelps', 'Mid-High', 'Iyas (External Global Coach)', 'Ankit', 'rphelps@hesss.com', '(971) 50 357 8897', 'http://linkedin.com/in/rachael-rose-phelps-262431152', '3 Months', '2026-03-12', '2026-06-12', 5, '', '', 'Not Done', NULL, NULL, '', '', '', '', 'Not Raised', 'Not Done', '2026-03-12T00:00:00.000Z', '2026-05-06T09:26:55.258Z', 'usr_admin_001');
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_003', 'active', 'Intoo US', 'Epic Games', 'Owais Masood', 'Low', 'Ashwin, Saima', 'Celeste', 'owaismasood@gmail.com', '3335145590', '', '3 Months', '2026-04-08', NULL, 3, 'LinkedIn session scheduled. Documents in the Drive', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-08T00:00:00.000Z', '2026-05-07T08:18:51.986Z', 'usr_admin_001');
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_004', 'active', 'Intoo US', 'Epic Games', 'Wardeh Tariq', 'Low', 'Saima, Ashwin', 'Ankit', 'wardehsoomro@gmail.com', '3155222138', '', '3 Months', '2026-04-07', NULL, 2, '', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-07T00:00:00.000Z', '2026-04-07T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_005', 'active', 'Intoo US', 'Epic Games', 'Muhammad Shahzaib Siddiqui', 'Low', 'Saima, Ashwin', 'Celeste', 'shahzaibsiddiqui.93@hotmail.com', '3493371026', '', '3 Months', '2026-04-10', NULL, 2, 'CV session complete, next session is for LinkedIn. Documents in the Drive', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-10T00:00:00.000Z', '2026-04-10T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_006', 'active', 'Intoo US', 'Epic Games', 'Saleha Kamran', 'Low', 'Saima, Ashwin', 'Sarah', 'anotherrartist@gmail.com', '92 323 5075056', 'https://www.linkedin.com/in/saleha-kamran/', '3 Months', '2026-04-06', '2026-06-06', 3, 'DiSC done', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-06T00:00:00.000Z', '2026-04-06T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_007', 'active', 'Intoo US', 'Epic Games', 'Yasir Qadeer', 'Low', 'Saima, Ashwin', 'Ankit', 'yasirqadeer86@yahoo.com', '3345022589', '', '3 Months', NULL, NULL, 0, '', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-01T00:00:00.000Z', '2026-04-01T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_008', 'active', 'Intoo US', 'Epic Games', 'Fahad Daniyal', 'Low', 'Saima, Ashwin', 'Sarah', 'daniyal0912@gmail.com', '923101377739', 'https://www.linkedin.com/in/fahaddaniyall/', '3 Months', '2026-04-15', '2026-06-15', 1, 'Session has been rescheduled (May 11-15). CV needs review, and unresponsive to follow ups', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-15T00:00:00.000Z', '2026-04-15T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_009', 'active', 'Intoo US', 'Epic Games', 'Bilal Ibrar', 'Low', 'Saima, Ashwin', 'Mehvish', 'bilal.ibrar@gmail.com', '3335151247', 'https://www.linkedin.com/in/bilalibrar/', '3 Months', '2026-04-10', '2026-06-10', 3, '', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-10T00:00:00.000Z', '2026-04-10T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_010', 'active', 'Intoo US', 'Epic Games', 'Komal Waseem', 'Low', 'Saima, Ashwin', 'Mehvish', 'ko5890@gmail.com', '923425965560', 'https://www.linkedin.com/in/komal-waseem/', '3 Months', '2026-04-14', '2026-06-15', 3, '', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-14T00:00:00.000Z', '2026-04-14T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_011', 'active', 'Intoo US', 'Epic Games', 'Mirza Ahsan', 'Low', 'Saima, Ashwin', 'Celeste', 'ahsanmirzamm@gmail.com', '3335375091', '', '3 Months', '2026-04-16', '2026-06-16', 1, 'Post introductory mail sent', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-16T00:00:00.000Z', '2026-04-16T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_012', 'active', 'Intoo US', 'Epic Games', 'Ali Imran', 'Low', 'Saima, Ashwin', 'Ankit', 'imran17788pk@gmail.com', '923329198434', '', '3 Months', '2026-04-23', NULL, 1, '', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_013', 'active', 'Intoo US', 'Epic Games', 'Saulat Mehmood', 'Low', 'Saima, Ashwin', 'Sarah', 'saulat.m1989@gmail.com', '3412825271', 'https://www.linkedin.com/in/saulat-mehmood/', '3 Months', '2026-04-23', '2026-06-23', 1, 'Post introductory mail sent + follow up', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-23T00:00:00.000Z', '2026-04-23T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_014', 'active', 'Intoo US', 'Epic Games', 'Imran Khan', 'Low', 'Saima, Ashwin', 'Mehvish', 'imrankkofficial@gmail.com', '3339858607', 'https://www.linkedin.com/in/imraannkhann/', '3 Months', NULL, NULL, 1, '', '', 'Not Done', NULL, NULL, NULL, NULL, NULL, NULL, 'Not Raised', 'Not Done', '2026-04-01T00:00:00.000Z', '2026-05-07T20:29:07.951Z', 'usr_admin_001');
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_015', 'completed', 'Challenger Grey', 'Aspen Technology', 'Ahmed El Assal', 'High', 'Saima', 'Ashwin', 'ahmed.elassal.ge@gmail.com', '971 (54) 9931955', '', '3 Months', '2025-01-01', '2025-04-01', 8, '', 'iD', 'Done', 'Y', 'Honewell', 'Honewell', 'Executive Director | Corporate Enterprise Solutions', 'Industrial and Aerospace Technology', 'Aspen Technology', 'Cleared', 'Done', '2025-01-01T00:00:00.000Z', '2025-04-01T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_016', 'completed', 'Challenger Grey', 'Aspen Technology', 'Andrew Sutherland', 'High', 'Saima', 'Ashwin', 'andrew.sutherland@saratoga-tech.com', '971 (50) 6585278', '', '3 Months', '2025-01-01', '2025-04-01', 8, '', 'iD', 'Done', 'Y', 'Copper Leaf', 'Copper Leaf', 'Senior Vice President Sales, Middle East, Africa & Asia Pacific, Japan', 'Enterprise software and management consulting', 'Aspen Technology', 'Cleared', 'Done', '2025-01-01T00:00:00.000Z', '2025-04-01T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_017', 'completed', 'Challenger Grey', 'Aspen Technology', 'Marjorie Gahal', 'High', 'Saima', 'Celeste', 'marjgahal@gmail.com', '973 3809 8716', '', '3 Months', '2025-01-01', '2025-04-01', 8, '', '', 'Done', 'Y', 'National Aquaculture Group', 'National Aquaculture Group', 'Sr. HR Generalist', 'Aquaculture', 'Aspen Technology', 'Cleared', 'Done', '2025-01-01T00:00:00.000Z', '2025-04-01T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_018', 'completed', 'Challenger Grey', 'NYU', 'Tamara Johnson', 'High', 'Saima', 'Mehvish', 'tamaranjohnsonis@gmail.com', '', '', '3 Months', '2024-01-01', '2024-04-01', 8, '', 'iS', 'Done', 'Y', 'Neom', 'Neom', 'HR Policy Design Senior', 'Tourism, Energy, Mobility, Biotech', 'NYU', 'Cleared', 'Done', '2024-01-01T00:00:00.000Z', '2024-04-01T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_019', 'active', 'Intoo US', 'Sprinklr', 'Mohamed Alkhatib', 'Mid', 'Moamer', 'Ashwin', 'mohamed2552@live.com', '971 52 903 5654', '', '3 Months', '2024-06-01', '2024-09-01', 8, '', '', 'Not Done', NULL, 'Sirion', 'Sirion', 'Senior Principal Solution Consultant', 'IT', 'Sprinklr', 'Not Raised', 'Not Done', '2024-06-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', NULL);
INSERT INTO candidates (id, status, partner, client_name, candidate_name, level_of_support, lead_coach, support, email, whatsapp, linkedin, duration, date_started, end_date, sessions_completed, notes, disc_style, disc_done, job_status, new_company, new_placement, position, sector, old_placement, invoice_status, costing_status, created_at, updated_at, updated_by) VALUES ('cand_020', 'active', 'Intoo US', 'Sprinklr', 'Rami Soubra', 'Mid', 'Sharmila', 'Ankit', 'rami.soubra@gmail.com', '', '', '3 Months', '2024-06-01', '2024-09-01', 8, 'Did not start', '', 'Not Done', NULL, 'UnifyApps', 'UnifyApps', 'Senior Solutions Consultant', 'IT & AI', 'Sprinklr', 'Not Raised', 'Not Done', '2024-06-01T00:00:00.000Z', '2024-06-01T00:00:00.000Z', NULL);

-- ----------------------------
-- Table: candidate_progress
-- ----------------------------
CREATE TABLE IF NOT EXISTS candidate_progress (
  candidate_id TEXT PRIMARY KEY,
  introductory_session INTEGER DEFAULT 0,
  cv_sessions INTEGER DEFAULT 0,
  linkedin_profile INTEGER DEFAULT 0,
  profiling INTEGER DEFAULT 0,
  networking_personal_branding INTEGER DEFAULT 0,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_001', 1, 1, 1, 1, 1);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_002', 1, 1, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_003', 1, 1, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_004', 1, 1, 1, 1, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_005', 1, 1, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_006', 1, 1, 1, 1, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_007', 0, 0, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_008', 1, 0, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_009', 1, 1, 1, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_010', 1, 1, 1, 1, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_011', 1, 0, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_012', 1, 0, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_013', 1, 0, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_014', 1, 0, 0, 0, 0);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_015', 1, 1, 1, 1, 1);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_016', 1, 1, 1, 1, 1);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_017', 1, 1, 1, 1, 1);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_018', 1, 1, 1, 1, 1);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_019', 1, 1, 1, 1, 1);
INSERT INTO candidate_progress (candidate_id, introductory_session, cv_sessions, linkedin_profile, profiling, networking_personal_branding) VALUES ('cand_020', 1, 1, 1, 1, 1);

-- ----------------------------
-- Table: candidate_activities
-- ----------------------------
CREATE TABLE IF NOT EXISTS candidate_activities (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  link TEXT,
  notes TEXT,
  created_at TEXT,
  created_by TEXT,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);


-- ----------------------------
-- Table: activity_log
-- ----------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  entity_type TEXT,
  entity_id TEXT,
  entity_name TEXT,
  created_at TEXT
);

INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_82d0c8d4', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T22:01:10.441Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_994beec6', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T22:01:06.550Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_129c36ce', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T21:58:38.574Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_fee0631c', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T21:58:32.538Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_0a5f44e4', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T21:58:25.814Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_fec41761', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T21:58:22.076Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_9f89e9d2', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_014', 'Imran Khan', '2026-05-07T20:29:07.954Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_d281e0f2', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_014', 'Imran Khan', '2026-05-07T20:29:07.887Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_b2ab28bb', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:29.840Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_a81062a8', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:29.486Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_345cfe44', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:29.212Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_8ab0b77f', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:28.671Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_be2a790e', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:28.222Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_81b2638a', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:27.587Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_345713f1', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:27.201Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_a75a5d55', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:26.794Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_27023a51', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:26.117Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_4b197897', 'usr_c7386a2d', 'Ashwin Noronha ', 'updated', 'candidate', 'cand_001', 'Joanna Rodrigues', '2026-05-07T20:23:25.564Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_9b2c8252', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_003', 'Owais Masood', '2026-05-07T08:18:51.988Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_14bc5fc8', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_003', 'Owais Masood', '2026-05-07T08:18:51.302Z');
INSERT INTO activity_log (id, user_id, user_name, action, entity_type, entity_id, entity_name, created_at) VALUES ('log_7fb8d349', 'usr_admin_001', 'Ashwin', 'updated', 'candidate', 'cand_002', 'Rachael Phelps', '2026-05-06T09:26:55.264Z');