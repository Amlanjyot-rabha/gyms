import express from 'express';
const router = express.Router();
import { getAllGyms, createGym, updateGymSettings, getGymSettings } from '../controllers/gymController.js';

router.route('/')
  .get(getAllGyms)
  .post(createGym);

router.route('/settings')
  .get(getGymSettings)
  .put(updateGymSettings);

export default router;
