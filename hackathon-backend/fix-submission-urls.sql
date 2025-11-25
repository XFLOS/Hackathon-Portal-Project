-- Fix submission file URLs to use working placeholder PDFs
-- Run this to update existing database records

UPDATE submissions 
SET file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE team_id IN (1, 2, 3);

-- Verify the update
SELECT id, team_id, title, file_url FROM submissions WHERE team_id IN (1, 2, 3);
