import { Router } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth'
import { MedicalHistory } from '../models/MedicalHistory'
import { evaluateRedFlagTriage } from '../services/triage'
import { analyzeSymptomsWithGroq } from '../services/symptomSuggestionGroq'
import { analyzeSymptomsWithRuleBasedStub } from '../services/symptomSuggestionStub'

const router = Router()

router.post('/recommend-symptoms', authenticateToken, requireRole(['Patient']), async (req, res, next) => {
  try {
    const { symptomsText, bodyRegion, selectedChips = [], age, gender, patientId } = req.body || {}
    // Build combined text from symptoms and selected chips; bodyRegion is handled separately by evaluateRedFlagTriage
    const combinedText = [symptomsText, ...(Array.isArray(selectedChips) ? selectedChips : [])]
      .filter((value): value is string => Boolean(value))
      .join(' ')

    console.log('[ai/recommend-symptoms] incoming', { userId: req.user?.id, symptomsText, bodyRegion, selectedChips, age, gender })

    if (!combinedText.trim()) {
      res.status(400).json({ success: false, message: 'Symptoms text is required' })
      return
    }

    const redFlagTier = evaluateRedFlagTriage(combinedText, bodyRegion)

    if (redFlagTier === 'critical') {
      const criticalResult = {
        specialty: 'Emergency Care',
        reasoning: 'Your symptoms match a critical red-flag pattern and should be treated as urgent medical care.',
        urgency_tier: 'critical' as const,
      }
      console.log('[ai/recommend-symptoms] response', { userId: req.user?.id, result: criticalResult })
      res.json({ success: true, data: criticalResult })
      return
    }

    const targetPatientId = patientId || req.user?.id
    const medicalHistory = targetPatientId ? await MedicalHistory.findOne({ patientId: targetPatientId }) : null

    const result = analyzeSymptomsWithRuleBasedStub(combinedText, medicalHistory)

    console.log('[ai/recommend-symptoms] response', { userId: req.user?.id, result })
    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

router.post('/analyze-symptoms', authenticateToken, requireRole(['Patient']), async (req, res, next) => {
  try {
    const { symptomsText, bodyRegion, patientId } = req.body || {}

    console.log('[ai/analyze-symptoms] incoming', { userId: req.user?.id, symptomsText, bodyRegion })

    if (!symptomsText) {
      res.status(400).json({ success: false, message: 'Symptoms text is required' })
      return
    }

    const redFlagTier = evaluateRedFlagTriage(symptomsText, bodyRegion)

    if (redFlagTier === 'critical') {
      const criticalResult = {
        specialty: 'Emergency Care',
        reasoning: 'Your symptoms match a critical red-flag pattern and should be treated as urgent medical care.',
        urgency_tier: 'critical' as const,
      }
      console.log('[ai/analyze-symptoms] response', { userId: req.user?.id, result: criticalResult })
      res.json({ success: true, data: criticalResult })
      return
    }

    const targetPatientId = patientId || req.user?.id
    const medicalHistory = targetPatientId ? await MedicalHistory.findOne({ patientId: targetPatientId }) : null

    const result = await analyzeSymptomsWithGroq(symptomsText, medicalHistory)

    console.log('[ai/analyze-symptoms] response', { userId: req.user?.id, result })
    res.json({ success: true, data: result })
  } catch (error) {
    next(error)
  }
})

export default router
