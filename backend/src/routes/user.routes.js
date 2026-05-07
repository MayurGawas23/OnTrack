import express from 'express'
import { Router } from 'express'
import { loginUser, RegisterUser, updateUser, getProfile, logout } from '../controllers/user.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', RegisterUser)
router.post('/login', loginUser)
router.put('/update', authMiddleware, updateUser)
router.get('/me', authMiddleware, getProfile)
router.post('/logout', logout)

export default router