import express from 'express';
import { getSubjects, addSubject, deleteSubject, updateSubject } from '../controllers/subject.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, addSubject);

router.route('/:code')
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

export default router;
