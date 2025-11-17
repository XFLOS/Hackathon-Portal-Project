import bcrypt from 'bcrypt';

// Generate bcrypt hash for a password
const password = process.argv[2] || 'Password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('\n=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('SQL Command to update student@demo.com:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'student@demo.com';`);
  console.log('\n');
});
