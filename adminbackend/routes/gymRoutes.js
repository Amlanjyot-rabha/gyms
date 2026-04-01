import express from 'express';
const router = express.Router();
import { getAllGyms, createGym } from '../controllers/gymController.js';

router.route('/')
  .get(getAllGyms)
  .post(createGym);

export default router;
