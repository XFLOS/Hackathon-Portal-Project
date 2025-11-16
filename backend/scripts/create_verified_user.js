#!/usr/bin/env node
/*
  Script to create a Firebase Authentication user with emailVerified=true using firebase-admin.

  Usage (PowerShell):
    $env:FIREBASE_SERVICE_ACCOUNT_FILE='C:\path\to\serviceAccount.json'; node backend/scripts/create_verified_user.js --email tester@example.com --password 'StrongPass123!' --displayName 'Test User'

  Or pass the service account JSON directly in FIREBASE_SERVICE_ACCOUNT_JSON env var.

  NOTE: This script requires the Firebase service account to be available to the server.
*/
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--email' && args[i+1]) { out.email = args[++i]; }
    else if (a === '--password' && args[i+1]) { out.password = args[++i]; }
    else if (a === '--displayName' && args[i+1]) { out.displayName = args[++i]; }
    else if (a === '--help' || a === '-h') { out.help = true; }
  }
  return out;
}

async function main() {
  const argv = parseArgs();
  if (argv.help) {
    console.log('Usage: node backend/scripts/create_verified_user.js --email user@example.com --password Pass123! --displayName "Test User"');
    process.exit(0);
  }

  const email = argv.email || process.env.CREATE_USER_EMAIL;
  const password = argv.password || process.env.CREATE_USER_PASSWORD;
  const displayName = argv.displayName || process.env.CREATE_USER_DISPLAY_NAME || '';

  if (!email || !password) {
    console.error('ERROR: email and password are required. Pass via --email/--password or CREATE_USER_EMAIL/CREATE_USER_PASSWORD env vars.');
    process.exit(2);
  }

  // Initialize firebase-admin using the project's config helper
  const fb = require(path.join(__dirname, '..', 'src', 'config', 'firebaseAdmin'));
  const admin = fb.init();
  if (!admin) {
    console.error('Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_FILE or FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
    process.exit(3);
  }

  try {
    // createUser supports emailVerified flag
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: true,
      displayName: displayName || undefined,
    });

    console.log('Created user:', userRecord.uid, userRecord.email, userRecord.displayName, 'emailVerified=', userRecord.emailVerified);
    process.exit(0);
  } catch (err) {
    // If user exists, report useful info
    if (err && err.code === 'auth/email-already-exists') {
      console.error('ERROR: Email already exists in Firebase Auth:', email);
      process.exit(4);
    }
    console.error('Failed to create user:', err && err.message ? err.message : err);
    process.exit(5);
  }
}

main();
