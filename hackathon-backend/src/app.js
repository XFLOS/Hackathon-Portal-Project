import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import judgeRoutes from './routes/judgeRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS Configuration - Allow specific origins with credentials
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://iridescent-cajeta-45d15b.netlify.app',
  'https://hackathonportalproject4g5.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hackathon Portal API Running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Hackathon Portal API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check database connection
app.get('/debug/db', async (req, res) => {
  try {
    const db = await import('./config/database.js');
    const result = await db.query('SELECT COUNT(*) as user_count FROM users');
    const teamResult = await db.query('SELECT COUNT(*) as team_count FROM teams');
    const membersResult = await db.query('SELECT COUNT(*) as members_count FROM team_members');
    
    res.json({
      status: 'connected',
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden',
      users: result.rows[0].user_count,
      teams: teamResult.rows[0].team_count,
      team_members: membersResult.rows[0].members_count
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden'
    });
  }
});

// API Routes
// Auth routes mounted at root level (login, register)
app.use('/', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/teams', teamRoutes);
app.use('/submission', submissionRoutes);
app.use('/judge', judgeRoutes);
app.use('/mentor', mentorRoutes);
app.use('/coordinator', coordinatorRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);
app.use('/messages', messageRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
