const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function run(id) {
  if (!id) {
    console.error('Usage: node delete_team.js <teamId>');
    process.exit(2);
  }
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(2);
  }
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = mongoose.connection.db;
    // mongoose.Types.ObjectId is a class; construct it with `new` to avoid runtime TypeError
    const ObjectId = mongoose.Types.ObjectId;
    const result = await db.collection('teams').deleteOne({ _id: new ObjectId(id) });
    console.log('Deleted count:', result.deletedCount);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Delete failed:', err && err.message ? err.message : err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

run(process.argv[2]);
