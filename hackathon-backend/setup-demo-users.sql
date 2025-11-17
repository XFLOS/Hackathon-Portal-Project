-- =====================================================================
-- Hackathon Portal Database Setup
-- Run this in Neon SQL Editor: https://console.neon.tech
-- =====================================================================

-- OPTIONAL: sample table from Neon intro (you can remove this whole block if you don't care)
CREATE TABLE IF NOT EXISTS playing_with_neon (
    id      SERIAL PRIMARY KEY,
    name    TEXT NOT NULL,
    value   REAL
);

INSERT INTO playing_with_neon (name, value)
SELECT LEFT(md5(i::TEXT), 10), random()
FROM generate_series(1, 10) AS s(i);

-- =====================================================================
-- REAL APP TABLE: users
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    full_name   TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,     -- bcrypt hash
    role        TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Clear any old demo users so re-running this script doesn't error
DELETE FROM users
WHERE email IN (
    'student@demo.com',
    'mentor@demo.com',
    'judge@demo.com',
    'coordinator@demo.com'
);

-- All 4 demo accounts use the same bcrypt hash password
-- (you'll log in with this plaintext password in the app)
-- password hash: $2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y
-- plaintext:  DemoPass123   (example – use whatever you actually encoded)

INSERT INTO users (full_name, email, password, role)
VALUES
    ('Demo Student',      'student@demo.com',      '$2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y', 'student'),
    ('Demo Mentor',       'mentor@demo.com',       '$2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y', 'mentor'),
    ('Demo Judge',        'judge@demo.com',        '$2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y', 'judge'),
    ('Demo Coordinator',  'coordinator@demo.com',  '$2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y', 'coordinator');

-- Check that everything is there
SELECT id, full_name, email, role, created_at
FROM users
ORDER BY id;
