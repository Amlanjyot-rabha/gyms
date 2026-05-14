import express from 'express';
const router = express.Router();

import { protectMember } from '../middleware/auth.js';
import { buyMembership } from '../controllers/membershipController.js';

router.post('/buy', protectMember, buyMembership);

export default router;
