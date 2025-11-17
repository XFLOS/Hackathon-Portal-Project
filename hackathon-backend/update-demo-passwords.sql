-- =====================================================================
-- Update Demo Users Password to DemoPass123
-- Run this in Neon SQL Editor if login fails with 401
-- =====================================================================

-- Update all demo accounts to use the correct password hash for DemoPass123
UPDATE users 
SET password = '$2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y'
WHERE email IN (
    'student@demo.com',
    'mentor@demo.com',
    'judge@demo.com',
    'coordinator@demo.com'
);

-- Verify the update
SELECT email, role, 
       CASE 
           WHEN password = '$2b$10$8G1tG0yL6Nq35p3xNmPR9uR2BPP9eRjKjG3yU4wJkn9uCEfT0uF6y' 
           THEN '✅ Correct password hash'
           ELSE '❌ Wrong password hash'
       END as password_status
FROM users
WHERE email LIKE '%@demo.com'
ORDER BY email;
