import {Router} from 'express'
import { chatWithAI, generateHabits, getChats, generateDietPlan } from '../controllers/ai.controller.js'
import verifyToken from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/generate_habits', generateHabits)
router.post('/generate_diet', verifyToken, generateDietPlan)
router.post('/chat', verifyToken, chatWithAI)
router.get('/chat', verifyToken, getChats)

export default router