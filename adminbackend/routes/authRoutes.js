import express from 'express';
import {
  loginAdmin,
  loginMember,
  logout,
  getMe,
  changePassword,
  register
} from '../controllers/authController.js';
import { protectAdmin, protectMember } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/admin/login', loginAdmin);
router.post('/member/login', loginMember);

// Admin session routes
router.get('/admin/me', protectAdmin, getMe);
router.post('/admin/logout', protectAdmin, logout);
router.post('/admin/change-password', protectAdmin, changePassword);

// Member session routes
router.get('/member/me', protectMember, getMe);
router.post('/member/logout', protectMember, logout);
router.post('/member/change-password', protectMember, changePassword);

export default router;
