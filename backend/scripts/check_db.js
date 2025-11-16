const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function run(){
  const uri = process.env.MONGO_URI;
  if(!uri){
    console.error('MONGO_URI not set');
    process.exit(2);
  }
  try{
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected via check script');
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', cols.map(c=>c.name));
    await mongoose.disconnect();
    process.exit(0);
  } catch(err){
    console.error('Check script failed:', err && err.message ? err.message : err);
    if(err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

run();
