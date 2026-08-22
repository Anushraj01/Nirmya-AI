import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { evaluateRedFlagTriage } from './services/triage';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Assessment {
  possibleConditions: { name: string; likelihood: 'high' | 'moderate' | 'low' }[];
  urgency: 'emergency' | 'urgent' | 'routine';
  recommendedSpecialist: string;
  redFlags: string[];
  disclaimer: string;
}

interface ChatbotResponse {
  type: 'question' | 'assessment' | 'emergency';
  message: string;
  quickReplies?: string[];
  assessment?: Assessment;
}

const SYSTEM_PROMPT = `You are Niramya AI's symptom-checking assistant, in the style of WebMD's symptom checker.

Goal: hold a short, focused conversation to understand the user's symptom(s), then produce a structured, non-diagnostic assessment that helps them decide which specialist to see.

Conversation rules:
- Ask ONE follow-up question at a time. Good things to ask about, in roughly this order: primary symptom detail, duration (how long), severity (1-10 scale), exact location, associated symptoms, what makes it better or worse, relevant history (existing conditions, medications, recent injury/illness).
- Keep questions short and plain-language. Offer 2-5 short quickReplies when the answer is naturally a pick-list (e.g. duration buckets, severity levels, yes/no).
- After roughly 4-7 exchanges, or sooner if you have enough signal, respond with type "assessment" instead of another question.
- NEVER state a diagnosis. Use phrasing like "may be associated with" or "commonly linked to", never "you have X".
- Always pick a recommendedSpecialist from a plausible real specialty (General Physician, Cardiologist, Dermatologist, ENT Specialist, Orthopedist, Gastroenterologist, Neurologist, Gynecologist, Psychiatrist, Pediatrician, etc).
- Always include a disclaimer in the assessment reminding the user this is not a diagnosis and to consult a doctor, especially for confirmation or worsening symptoms.
- If the user's message describes something that sounds urgent but not an outright emergency, set urgency to "urgent" and say so plainly.

Output format:
Respond ONLY with valid JSON, no markdown fences, no commentary outside the JSON, matching exactly:
{
  "type": "question" | "assessment",
  "message": string,
  "quickReplies": string[] (optional, only for type "question"),
  "assessment": {
    "possibleConditions": [{ "name": string, "likelihood": "high" | "moderate" | "low" }],
    "urgency": "emergency" | "urgent" | "routine",
    "recommendedSpecialist": string,
    "redFlags": string[],
    "disclaimer": string
  } (only include when type is "assessment")
}`;

export const symptomChat = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Fast-path: check the latest user message for red flags before touching the LLM.
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';
    const redFlagTier = evaluateRedFlagTriage(lastUserMessage);

    if (redFlagTier === 'critical') {
      const emergencyResponse: ChatbotResponse = {
        type: 'emergency',
        message:
          "Based on what you've described, this could be a medical emergency. Please call your local emergency number or go to the nearest emergency room right away — this chatbot isn't able to safely assess emergencies.",
        assessment: {
          possibleConditions: [],
          urgency: 'emergency',
          recommendedSpecialist: 'Emergency Room',
          redFlags: ['Critical red-flag symptom pattern detected'],
          disclaimer: 'This is not a diagnosis. Please seek immediate in-person medical care.'
        }
      };
      return res.json(emergencyResponse);
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.4,
      max_tokens: 700,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    let parsed: ChatbotResponse;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        type: 'question',
        message: "Sorry, could you rephrase that? I want to make sure I understand your symptom correctly."
      };
    }

    res.json(parsed);
  } catch (err) {
    console.error('Symptom chat error:', err);
    res.status(500).json({ error: 'Failed to process symptom chat' });
  }
};
