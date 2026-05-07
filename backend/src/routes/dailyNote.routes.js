import express from 'express';
import { getDailyNote, saveDailyNote, getRecentDailyNotes } from '../controllers/dailyNote.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getDailyNote);
router.post('/', saveDailyNote);
router.get('/recent', getRecentDailyNotes);

export default router;
