import { Router } from 'express'
import { symptomChat } from '../symptomChat.controller'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = Router()

// POST /api/symptom-chat
router.post('/symptom-chat', authenticateToken, requireRole(['Patient']), symptomChat)

export default router
