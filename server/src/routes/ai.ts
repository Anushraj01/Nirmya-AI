import { Router } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth'
import { MedicalHistory } from '../models/MedicalHistory'
import { evaluateRedFlagTriage } from '../services/triage'
import { analyzeSymptomsWithGroq } from '../services/symptomSuggestionGroq'

const router = Router()

router.post('/analyze-symptoms', authenticateToken, requireRole(['Patient']), async (req, res, next) => {
  try {
    const { symptomsText, bodyRegion, patientId } = req.body || {}

    if (!symptomsText) {
      res.status(400).json({ success: false, message: 'Symptoms text is required' })
      return
    }

    const redFlagTier = evaluateRedFlagTriage(symptomsText, bodyRegion)

    if (redFlagTier === 'critical') {
      res.json({
        success: true,
        data: {
          specialty: 'Emergency Care',
          reasoning: 'Your symptoms match a critical red-flag pattern and should be treated as urgent medical care.',
          follow_up_question: 'Are you in immediate danger or experiencing severe symptoms right now?',
          urgency_tier: 'urgent',
        },
      })
      return
    }

    const targetPatientId = patientId || req.user?.id
    const medicalHistory = targetPatientId ? await MedicalHistory.findOne({ patientId: targetPatientId }) : null

    const result = await analyzeSymptomsWithGroq(symptomsText, medicalHistory)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

export default router
