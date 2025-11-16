import app from './app.js';
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

// Test database connection before starting server
const startServer = async () => {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('<')) {
      console.warn('⚠️  Starting server WITHOUT database connection');
      console.warn('⚠️  Configure DATABASE_URL in .env to enable database features\n');
      
      // Start server without database
      app.listen(PORT, () => {
        console.log('🚀 Server is running on port', PORT);
        console.log(`🌐 API available at http://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
        console.log('\n⚠️  Remember to configure your .env file!\n');
      });
    } else {
      // Test database connection
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');

      // Start server with database
      app.listen(PORT, () => {
        console.log('🚀 Server is running on port', PORT);
        console.log(`🌐 API available at http://localhost:${PORT}`);
        console.log(`💚 Health check: http://localhost:${PORT}/health`);
      });
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.warn('⚠️  Starting server anyway (database features will not work)\n');
    
    // Start server even if database fails
    app.listen(PORT, () => {
      console.log('🚀 Server is running on port', PORT, '(without database)');
      console.log(`🌐 API available at http://localhost:${PORT}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
    });
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

startServer();
