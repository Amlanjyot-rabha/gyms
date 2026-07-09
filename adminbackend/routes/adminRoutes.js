import express from 'express';
import {
  addMember,
  cancelMembership,
  renewMembership,
  getMembers,
  getAllAttendance,
  addAdmin,
  getAdmins,
  updateGym,
  getDashboardStats,
  getWhatsAppStatus,
  connectWhatsApp,
  disconnectWhatsApp,
  sendWhatsAppTestMessage,
  deleteMember
} from '../controllers/adminController.js';
import { protectAdmin, authorize } from '../middleware/auth.js';

const router = express.Router();

// Dashboard stats — admin and super_admin
router.get('/stats', protectAdmin, authorize('admin', 'super_admin'), getDashboardStats);

// Member management — admin and super_admin
router.post('/members', protectAdmin, authorize('admin', 'super_admin'), addMember);
router.get('/members', protectAdmin, authorize('admin', 'super_admin'), getMembers);
router.put('/members/:id/cancel', protectAdmin, authorize('admin', 'super_admin'), cancelMembership);
router.post('/members/:id/renew', protectAdmin, authorize('admin', 'super_admin'), renewMembership);
router.delete('/members/:id', protectAdmin, authorize('admin', 'super_admin'), deleteMember);

// Attendance — admin and super_admin
router.get('/attendance', protectAdmin, authorize('admin', 'super_admin'), getAllAttendance);

// Gym configuration — admin and super_admin
router.put('/gym', protectAdmin, authorize('admin', 'super_admin'), updateGym);

// Admin management — viewing list: admin and super_admin; creating: super_admin only
router.get('/admins', protectAdmin, authorize('admin', 'super_admin'), getAdmins);
router.post('/admins', protectAdmin, authorize('super_admin'), addAdmin);

// WhatsApp Integration — admin and super_admin
router.get('/whatsapp/status', protectAdmin, authorize('admin', 'super_admin'), getWhatsAppStatus);
router.post('/whatsapp/connect', protectAdmin, authorize('admin', 'super_admin'), connectWhatsApp);
router.post('/whatsapp/disconnect', protectAdmin, authorize('admin', 'super_admin'), disconnectWhatsApp);
router.post('/whatsapp/test', protectAdmin, authorize('admin', 'super_admin'), sendWhatsAppTestMessage);

export default router;
