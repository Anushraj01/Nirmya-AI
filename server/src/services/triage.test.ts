import { evaluateRedFlagTriage } from './triage'

describe('evaluateRedFlagTriage', () => {
  it('detects severe chest pain with breathlessness', () => {
    expect(evaluateRedFlagTriage("sudden crushing pain in my chest, can't catch my breath")).toBe('critical')
  })

  it('detects heavy uncontrolled bleeding', () => {
    expect(evaluateRedFlagTriage("there's blood everywhere and it won't stop")).toBe('critical')
  })

  it('detects suicidal ideation', () => {
    expect(evaluateRedFlagTriage("I don't want to live anymore")).toBe('critical')
  })

  it('detects a single clear stroke sign', () => {
    expect(evaluateRedFlagTriage('my face feels droopy on one side, nothing else feels wrong')).toBe('critical')
  })

  it.each([
    'severe chest pain and shortness of breath',
    'intense chest pressure with trouble breathing',
    'crushing chest tightness and I cannot breathe',
    'my face feels droopy and my speech is slurred',
    'one side of my face is numb and I have weakness on my left side',
    'I have slurred speech and one-sided weakness',
    'heavy bleeding that I cannot stop',
    'profuse blood loss and I am bleeding heavily',
    'I want to end my life',
    'I feel like killing myself',
  ])('returns critical for %p', (symptomText) => {
    expect(evaluateRedFlagTriage(symptomText)).toBe('critical')
  })

  it.each([
    'mild chest tightness after climbing stairs',
    'a little shortness of breath while exercising',
    'minor headache and fatigue',
    'sore throat and runny nose',
    'I twisted my ankle and it hurts',
    'small cut with a little bleeding',
    'I feel anxious but not suicidal',
    'my face is a bit numb but I can talk normally',
    'mild nausea after lunch',
    'occasional dizziness when standing up',
  ])('returns null for %p', (symptomText) => {
    expect(evaluateRedFlagTriage(symptomText)).toBeNull()
  })
})
