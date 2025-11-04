const path = require('path');
const dotenv = require('dotenv');

// Load the backend-specific .env by default
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || null,
  jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
};

module.exports = config;
