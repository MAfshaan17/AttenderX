import express from 'express';
import { markAttendance, getAllAttendance, getStats, getPersonalStats } from '../controllers/attendance.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/all', getAllAttendance);
router.get('/stats', getStats);
router.get('/me/stats', protect, getPersonalStats);

export default router;
