import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
import gymRoutes from './routes/gymRoutes.js';

const app = express();

// Body parser
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Mount routers
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

app.use('/api/gyms', gymRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
