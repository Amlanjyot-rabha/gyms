import express from 'express';
import { getMemberProfile } from '../controllers/membershipController.js';
import { protectMember } from '../middleware/auth.js';

const router = express.Router();

// Request logging middleware
router.use((req, res, next) => {
  console.log('[MEMBER-ROUTE] Incoming request:', { method: req.method, path: req.path, url: req.url });
  next();
});

// Member portal profile — member role only
router.get('/profile', protectMember, getMemberProfile);

export default router;
