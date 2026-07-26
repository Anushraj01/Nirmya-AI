import type { IMedicalHistory } from '../models/MedicalHistory'

/**
 * TEMPORARY rule-based stand-in for the real Claude API integration.
 * This is deferred until API billing is configured, but it implements the same
 * response contract as the eventual LLM-backed triage pipeline so it can be
 * swapped in later without any frontend changes.
 */

export type SymptomSuggestionResponse = {
  specialty: string
  reasoning: string
  follow_up_question: string | null
  urgency_tier: 'urgent' | 'routine'
  secondarySuggestions?: string[]
}

type SymptomRuleEntry = {
  specialty: string
  keywords: string[]
  reasoningTemplate: string
  followUpQuestion: string
  urgentKeywords?: string[]
}

export const symptomRuleTable: SymptomRuleEntry[] = [
  {
    specialty: 'Cardiologist',
    keywords: ['chest', 'heart', 'palpitations', 'shortness of breath', 'breathless', 'chest pain', 'heartburn'],
    reasoningTemplate: 'Your reported {symptom} is commonly evaluated by a {specialty}.',
    followUpQuestion: 'How long have you had this, and does it come and go or stay constant?',
    urgentKeywords: ['chest pain', 'shortness of breath', 'palpitations'],
  },
  {
    specialty: 'Dermatologist',
    keywords: ['rash', 'itching', 'skin', 'hives', 'eczema', 'red spot', 'dry skin'],
    reasoningTemplate: 'Your symptoms suggest a skin-related issue, so a {specialty} would be the right specialist to consult.',
    followUpQuestion: 'Is the rash or irritation spreading, or is it limited to one area?',
    urgentKeywords: ['infection', 'spreading'],
  },
  {
    specialty: 'Orthopedic',
    keywords: ['joint', 'bone', 'knee', 'ankle', 'back pain', 'muscle pain', 'sprain', 'fracture', 'swollen joint'],
    reasoningTemplate: 'Your reported {symptom} points to a bone, joint, or muscle concern that an {specialty} commonly evaluates.',
    followUpQuestion: 'Did this start after an injury, or did it come on gradually?',
    urgentKeywords: ['fracture', 'severe swelling'],
  },
  {
    specialty: 'Gastroenterologist',
    keywords: ['stomach', 'digestive', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'acid reflux'],
    reasoningTemplate: 'Your reported {symptom} is commonly assessed by a {specialty}.',
    followUpQuestion: 'Is the problem constant, or does it come and go with meals or bowel movements?',
    urgentKeywords: ['vomiting blood', 'severe abdominal pain'],
  },
  {
    specialty: 'Neurologist',
    keywords: ['headache', 'dizziness', 'vision', 'blurred vision', 'migraine', 'seizure', 'tingling', 'numbness'],
    reasoningTemplate: 'Your reported {symptom} can be related to the nervous system, which a {specialty} is trained to evaluate.',
    followUpQuestion: 'Have you noticed any weakness, numbness, or changes in vision with this?',
    urgentKeywords: ['seizure', 'sudden weakness', 'vision loss'],
  },
  {
    specialty: 'ENT Specialist',
    keywords: ['ear', 'nose', 'throat', 'sore throat', 'sinus', 'cold', 'cough', 'hoarse', 'blocked nose'],
    reasoningTemplate: 'Your reported {symptom} is commonly evaluated by an {specialty}.',
    followUpQuestion: 'How long have you had the symptoms, and are you also running a fever?',
    urgentKeywords: ['high fever', 'trouble breathing'],
  },
  {
    specialty: 'Ophthalmologist',
    keywords: ['eye', 'eyeball', 'red eye', 'blurred vision', 'vision', 'contact lens', 'watery eye'],
    reasoningTemplate: 'Your reported {symptom} points to an eye-related concern, so an {specialty} would be appropriate.',
    followUpQuestion: 'Have you noticed any pain, redness, or sudden changes in vision?',
    urgentKeywords: ['sudden vision loss'],
  },
  {
    specialty: 'Gynecologist',
    keywords: ['period', 'pregnancy', 'pelvic pain', 'menstrual', 'ovarian', 'vaginal bleeding'],
    reasoningTemplate: 'Your reported {symptom} is commonly evaluated by a {specialty}.',
    followUpQuestion: 'Are you pregnant, or has the symptom been ongoing for several days?',
    urgentKeywords: ['heavy bleeding', 'severe pelvic pain'],
  },
  {
    specialty: 'Pediatrician',
    keywords: ['child', 'kid', 'infant', 'baby', 'school age', 'toddler'],
    reasoningTemplate: 'Because this involves a child-related concern, a {specialty} is a sensible next step.',
    followUpQuestion: 'How old is the child, and how long have the symptoms been present?',
  },
  {
    specialty: 'Dentist',
    keywords: ['tooth', 'gum', 'mouth pain', 'dental', 'jaw pain'],
    reasoningTemplate: 'Your reported {symptom} sounds like a dental issue that a {specialty} can assess.',
    followUpQuestion: 'Is the pain triggered by chewing, or is it present even at rest?',
    urgentKeywords: ['swelling', 'fever'],
  },
  {
    specialty: 'Psychiatrist',
    keywords: ['anxiety', 'depression', 'mood', 'panic', 'sleep', 'sad', 'stress', 'insomnia'],
    reasoningTemplate: 'Your reported {symptom} points to a mental health or sleep-related concern, so a {specialty} would be appropriate.',
    followUpQuestion: 'How long have these symptoms been affecting your daily life?',
    urgentKeywords: ['self harm', 'suicidal'],
  },
  {
    specialty: 'General Physician',
    keywords: ['fever', 'cold', 'flu', 'cough', 'fatigue', 'general', 'body ache', 'sore'],
    reasoningTemplate: 'Your reported {symptom} is broad enough to start with a {specialty} for a general assessment.',
    followUpQuestion: 'How long have you had the symptoms, and do you have a fever or shortness of breath?',
    urgentKeywords: ['high fever', 'chest pain'],
  },
]

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const analyzeSymptomsWithRuleBasedStub = (
  symptomsText: string,
  medicalHistory?: Partial<IMedicalHistory> | null,
): SymptomSuggestionResponse => {
  const combinedText = [symptomsText, medicalHistory ? [medicalHistory.conditions, medicalHistory.allergies, medicalHistory.medications, medicalHistory.familyHistory].flat().join(' ') : '']
    .filter(Boolean)
    .join(' ')

  const normalizedText = normalizeText(combinedText)

  const matchedRules = symptomRuleTable.filter((rule) => rule.keywords.some((keyword) => normalizedText.includes(normalizeText(keyword))))

  const primaryRule = matchedRules[0] ?? symptomRuleTable[symptomRuleTable.length - 1]

  const matchedKeyword = primaryRule.keywords.find((keyword) => normalizedText.includes(normalizeText(keyword))) ?? 'your symptoms'

  const reasoning = primaryRule.reasoningTemplate
    .replace('{symptom}', matchedKeyword)
    .replace('{specialty}', primaryRule.specialty)

  const urgency_tier: 'urgent' | 'routine' = primaryRule.urgentKeywords?.some((keyword) => normalizedText.includes(normalizeText(keyword)))
    ? 'urgent'
    : 'routine'

  return {
    specialty: primaryRule.specialty,
    reasoning,
    follow_up_question: primaryRule.followUpQuestion,
    urgency_tier,
    secondarySuggestions: matchedRules.length > 1 ? matchedRules.slice(1).map((rule) => rule.specialty) : undefined,
  }
}
