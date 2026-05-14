import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';

// Load env vars first, before anything else
dotenv.config();

// Connect to database
connectDB();

// Route files
import authRoutes from './routes/authRoutes.js';
import membershipRoutes from './routes/membershipRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import gymRoutes from './routes/gymRoutes.js';
import upload from './middleware/upload.js';
import seedData from './utils/seeder.js';
import { startReminderCron } from './cron/reminderCron.js';

const app = express();

// Body parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Enable CORS — all three frontend apps + common Vite dev ports
const corsOptions = {
  origin: [
    'https://admin-dashboard-pa7w.onrender.com',  // admin dashboard (primary)
    'https://content-management-system-yv4g.onrender.com',  // admin dashboard (alternate)
    'https://member-portal-78vo.onrender.com',  // member portal
    // Vite preview
  ],
  credentials: true           // Required for HttpOnly cookies cross-origin
};
app.use(cors(corsOptions));

// Health check route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is running...' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/gym', gymRoutes);

// Image upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    url: req.file.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT;

// Run seeder after server starts
const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  await seedData();
  
  // Start automated email reminders
  startReminderCron();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
