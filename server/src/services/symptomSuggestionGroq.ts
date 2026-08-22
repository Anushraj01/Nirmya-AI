import Groq from 'groq-sdk';
import { analyzeSymptomsWithRuleBasedStub, type SymptomSuggestionResponse } from './symptomSuggestionStub';
import type { IMedicalHistory } from '../models/MedicalHistory';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a medical triage assistant. Your goal is to suggest the appropriate medical specialist based on symptoms and medical history.
IMPORTANT RULES:
1. NEVER state a diagnosis.
2. ALWAYS recommend professional consultation.
3. Ask at most one short follow-up question if genuinely needed to distinguish between specialists, otherwise return null.
4. Respond ONLY in this exact JSON shape:
{
  "specialty": string,
  "reasoning": string,
  "follow_up_question": string | null,
  "urgency_tier": "urgent" | "routine"
}
Ensure the "reasoning" field is one plain-language sentence.`;

export async function analyzeSymptomsWithGroq(
  symptomsText: string,
  medicalHistory?: Partial<IMedicalHistory> | null
): Promise<SymptomSuggestionResponse> {
  try {
    const historyText = medicalHistory 
      ? `Patient History: ${[medicalHistory.conditions, medicalHistory.allergies, medicalHistory.medications].flat().filter(Boolean).join(', ')}`
      : 'No medical history provided.';

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Symptoms: ${symptomsText}\n${historyText}` }
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from Groq');

    return JSON.parse(content) as SymptomSuggestionResponse;
  } catch (error) {
    console.error('Groq triage failed, falling back to rule-based stub:', error);
    return analyzeSymptomsWithRuleBasedStub(symptomsText, medicalHistory);
  }
}
