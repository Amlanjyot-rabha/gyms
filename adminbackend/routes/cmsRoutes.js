import express from 'express';
import { getCMSContent, updateCMSContent } from '../controllers/cmsController.js';
import { protectAdmin, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public — anyone can read CMS content (used by cmssite frontend)
router.get('/', getCMSContent);

// Protected — only admin and super_admin can update CMS content
router.put('/', protectAdmin, authorize('admin', 'super_admin'), updateCMSContent);

export default router;
