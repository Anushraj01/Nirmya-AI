export const evaluateRedFlagTriage = (symptomText: string, bodyRegion?: string): 'critical' | null => {
  const normalizedText = [symptomText, bodyRegion]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const hasChestPain = /(chest|heart)/i.test(normalizedText) && /(pain|pressure|tightness|ache|discomfort|heaviness|soreness)/i.test(normalizedText)
  const hasSevereChestPain = hasChestPain && /(severe|intense|excruciating|crushing|sharp|heavy|terrible|worse|sudden|acute)/i.test(normalizedText)
  const hasBreathlessness =
    /(shortness of breath|short of breath|breathless|cant breathe|cannot breathe|trouble breathing|difficulty breathing|suffocating|gasping|out of breath|cant catch my breath|cant catch breath|cannot catch my breath|breathlessness|cant breathe)/i.test(
      normalizedText,
    )

  if (hasSevereChestPain && hasBreathlessness) {
    return 'critical'
  }

  const faceDroopPattern = /(face|facial).{0,20}(droop|drooping|droopy|weak|weakness|paralyzed|paralysis|one side|one sided)/i
  const armWeaknessPattern = /(arm|hand|weakness|weak).{0,20}(cant lift|cannot lift|can't lift|can't raise|cannot raise|can't move|cannot move|drop|numb|paralyzed|paralysis|one side|one sided)/i
  const speechPattern = /(slur|slurred|slurry|speech).{0,40}(slur|slurred|slurry|trouble|cannot speak|cant speak|unable to speak|confused)/i

  const strokeSignals = [faceDroopPattern, armWeaknessPattern, speechPattern].filter((pattern) => pattern.test(normalizedText))
  const hasStrokePhrase = /(slurred speech|slurred|slur|one sided weakness|one-sided weakness|one side weakness|weak on one side|weakness on one side)/i.test(normalizedText)

  if (strokeSignals.length >= 1 || hasStrokePhrase) {
    return 'critical'
  }

  const hasBleeding = /(bleed|bleeding|blood)/i.test(normalizedText)
  const hasUncontrolledBleeding = /(heavy|profuse|massive|gushing|pouring|uncontrolled|cant stop|cannot stop|wont stop|excessive|severe|everywhere)/i.test(normalizedText)

  if (hasBleeding && hasUncontrolledBleeding) {
    return 'critical'
  }

  const hasSuicidalIdeation =
    /(suicidal|suicide|kill myself|killing myself|end my life|end it all|want to die|want to end my life|want to live|dont want to live|don't want to live|want everything to end|just want everything to end|hurt myself|self harm|self-harm|take my own life)/i.test(
      normalizedText,
    ) && !/(not suicidal|not thinking of suicide|not thinking about suicide|not wanting to die|not want to die|not planning to end my life|not going to hurt myself|not going to end it)/i.test(
      normalizedText,
    )

  if (hasSuicidalIdeation) {
    return 'critical'
  }

  return null
}
