# Fix Submission File URLs

## Problem
The demo submission file URLs point to non-existent Cloudinary paths, causing 404 errors when users try to view uploaded files.

## Solution

### Option 1: Update Production Database (Recommended)

Run this SQL directly in your Neon database dashboard:

```sql
-- Update all demo submission file URLs to use working placeholder PDF
UPDATE submissions 
SET file_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
WHERE team_id IN (1, 2, 3) AND file_url LIKE '%cloudinary%';

-- Verify the update
SELECT id, team_id, title, file_url 
FROM submissions 
WHERE team_id IN (1, 2, 3)
ORDER BY team_id;
```

**Steps:**
1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Paste and run the UPDATE query above
5. Verify with the SELECT query
6. Refresh your app - file links should now work

### Option 2: Use the Node.js Script

If you have the DATABASE_URL configured locally:

```bash
cd hackathon-backend
node fix-submission-urls.js
```

### Option 3: Re-run Complete Database Setup

This will reset all data to the fixed version:

```bash
# In Neon SQL Editor, run:
# First backup your data if needed, then run:
```

Copy the contents from `COMPLETE-DATABASE-SETUP.sql` (which has been updated with working URLs).

## What Was Fixed

Changed all demo submission file URLs from:
```
https://res.cloudinary.com/dxjum86lp/raw/upload/demo/team-phoenix-presentation.pdf
```

To:
```
https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
```

This placeholder PDF is publicly accessible and will work for demo purposes.

## Future File Uploads

When users upload new files through the submission page:
- Files will be uploaded to YOUR Cloudinary account (if configured)
- The `file_url` will point to your actual Cloudinary storage
- No manual fixes needed for new uploads

## Verify the Fix

1. Login as student@demo.com (password: 12345678)
2. Go to Submissions page
3. Look for existing submission
4. The file preview should now work without 404 errors
