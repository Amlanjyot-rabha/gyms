import express from 'express';
import { markAttendance } from '../controllers/attendanceController.js';
import { protectMember } from '../middleware/auth.js';

const router = express.Router();

// Only active members can mark their own attendance
router.post('/', protectMember, markAttendance);

export default router;
