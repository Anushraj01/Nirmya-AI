import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BodyMap } from './BodyMap'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

type UrgencyTier = 'critical' | 'urgent' | 'routine'

interface TriageResult {
  specialty: string
  reasoning: string
  follow_up_question: string | null
  urgency_tier: UrgencyTier
  tier?: 'critical'
}

/* const BODY_REGIONS: { id: string; label: string; chips: string[] }[] = [
  { id: 'chest', label: 'Chest', chips: ['Chest pain', 'Palpitations', 'Tightness'] },
  { id: 'head', label: 'Head', chips: ['Headache', 'Dizziness', 'Blurred vision'] },
  { id: 'abdomen', label: 'Abdomen', chips: ['Stomach pain', 'Nausea', 'Bloating'] },
  { id: 'joints', label: 'Joints', chips: ['Joint pain', 'Swelling', 'Stiffness'] },
  { id: 'skin', label: 'Skin', chips: ['Rash', 'Itching', 'Redness'] },
] */

const api = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true })

export function SymptomChecker() {
  const { accessToken } = useAuth()

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [followUpAnswer, setFollowUpAnswer] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TriageResult | null>(null)

  const toggleChip = (chip: string) => {
    setSelectedChips((current) => (current.includes(chip) ? current.filter((c) => c !== chip) : [...current, chip]))
  }

  const buildSymptomText = () => {
    const parts: string[] = []
    if (selectedRegion) parts.push(`Region: ${selectedRegion}`)
    if (selectedChips.length) parts.push(selectedChips.join(', '))
    if (freeText.trim()) parts.push(freeText.trim())
    if (followUpAnswer.trim()) parts.push(followUpAnswer.trim())
    return parts.join('. ')
  }

  const submitSymptoms = async () => {
    const symptomText = buildSymptomText()
    if (!symptomText) {
      setError('Please select a body region or describe your symptoms first.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const response = await api.post(
        'ai/analyze-symptoms',
        { symptomsText: symptomText, bodyRegion: selectedRegion },
        { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} },
      )
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to analyze symptoms')
      }
      setResult(response.data.data as TriageResult)
      setFollowUpAnswer('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetChecker = () => {
    setSelectedRegion(null)
    setSelectedChips([])
    setFreeText('')
    setFollowUpAnswer('')
    setResult(null)
    setError('')
  }

  const isCritical = result?.urgency_tier === 'critical' || result?.tier === 'critical'

  // Full-screen critical alert — no booking option shown per Design Doc Section 7.3
  if (isCritical) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#D85A30] px-6 py-10">
        <div className="max-w-lg rounded-[32px] bg-white p-8 text-center shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D85A30]">Medical emergency</p>
          <h1 className="mt-3 text-2xl font-semibold text-[#1E5B8C]">This may be a medical emergency.</h1>
          <p className="mt-3 text-[#5F5E5A]">
            Please seek immediate medical attention. Do not wait for a routine appointment.
          </p>
          <div className="mt-6 space-y-3">
            <a href="tel:112" className="block w-full rounded-2xl bg-[#D85A30] px-4 py-3 font-semibold text-white transition hover:bg-[#b94a24]">
              Call Emergency Services (112)
            </a>
            <a href="tel:102" className="block w-full rounded-2xl border border-[#D85A30] px-4 py-3 font-semibold text-[#D85A30] transition hover:bg-[#FDEDE8]">
              Call Ambulance (102)
            </a>
          </div>
          <p className="mt-4 text-sm text-[#5F5E5A]">Go to your nearest emergency room immediately.</p>
          <button
            type="button"
            onClick={resetChecker}
            className="mt-6 text-sm font-medium text-[#1E5B8C] underline"
          >
            Start over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Persistent disclaimer bar */}
      <div className="rounded-2xl border border-[#E1F5EE] bg-[#E1F5EE] px-4 py-3 text-sm text-[#0F6E56]">
        This helps you choose the right specialist. It is not a diagnosis.
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-[#5F5E5A]">
        <span className="inline-block h-2 w-2 rounded-full bg-[#0F6E56]" />
        Using your saved medical history
      </div>

      {!result && (
  <div className="grid gap-6 md:grid-cols-2">
    {/* Entry A — Body map */}
    <div className="rounded-3xl border border-[#E1F5EE] p-5">
     <h2 className="font-semibold text-[#1E5B8C]">Point to where it hurts</h2>
      <p className="mt-1 text-sm text-[#5F5E5A]">Select the area that best matches your symptoms.</p>
       <div className="mt-4">
        <BodyMap
          selectedRegion={selectedRegion}
          selectedChips={selectedChips}
          onSelectRegion={setSelectedRegion}
          onToggleChip={toggleChip}
        />
      </div>
    </div>

    {/* Entry B — Free text chat, equal visual weight */}
    <div className="rounded-3xl border border-[#E1F5EE] p-5">
      <h2 className="font-semibold text-[#1E5B8C]">Describe it in your own words</h2>
       <p className="mt-1 text-sm text-[#5F5E5A]">
        For symptoms that don't map to one area — fatigue, mood, sleep, or feeling "off."
      </p>
      <textarea
        value={freeText}
        onChange={(event) => setFreeText(event.target.value)}
        rows={6}
        placeholder="Tell us what's going on..."
        className="mt-4 w-full rounded-2xl border border-[#E1F5EE] bg-[#F7F9F8] px-4 py-3 text-sm outline-none"
      />
    </div>
  </div>
)}
      {!result && (
        <div className="flex flex-col gap-3">
          {error && (
            <div className="rounded-2xl border border-[#D85A30] bg-[#FDEDE8] px-4 py-3 text-sm text-[#D85A30]">{error}</div>
          )}
          <button
            type="button"
            onClick={submitSymptoms}
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#0F6E56] px-4 py-3 font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-70 md:w-auto md:self-start"
          >
            {isLoading ? 'Analyzing...' : 'Check my symptoms'}
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-3xl border border-[#E1F5EE] bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">
            {result.urgency_tier === 'urgent' ? 'Needs prompt attention' : 'Best match'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1E5B8C]">{result.specialty}</h2>
          <p className="mt-2 text-[#5F5E5A]">{result.reasoning}</p>

          {result.follow_up_question && (
            <div className="mt-4 rounded-2xl bg-[#E1F5EE] p-4">
              <p className="text-sm font-medium text-[#0F6E56]">{result.follow_up_question}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={followUpAnswer}
                  onChange={(event) => setFollowUpAnswer(event.target.value)}
                  placeholder="Your answer..."
                  className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={submitSymptoms}
                  disabled={isLoading}
                  className="rounded-2xl bg-[#0F6E56] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-70"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={
                result.urgency_tier === 'urgent'
                  ? '/emergency'
                  : `/patient/find-doctors?specialty=${encodeURIComponent(result.specialty)}`
              }
              className="rounded-full bg-[#1E5B8C] px-4 py-2 font-medium text-white transition hover:bg-[#163f61]"
            >
              {result.urgency_tier === 'urgent' ? 'Go to Emergency Care' : `Find ${result.specialty}s near me`}
            </Link>
            <button type="button" onClick={resetChecker} className="rounded-full border border-[#E1F5EE] px-4 py-2 font-medium text-[#5F5E5A]">
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}