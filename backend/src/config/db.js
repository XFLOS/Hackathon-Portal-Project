const mongoose = require('mongoose');
const config = require('./env');

async function connect() {
  if (!config.mongoUri) {
    // Not configured — skip automatic connection
    // eslint-disable-next-line no-console
    console.log('MONGO_URI not set; skipping DB connection');
    return null;
  }

  // Use mongoose connection options suitable for modern versions
  await mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
  return mongoose.connection;
}

module.exports = { connect, mongoose };
