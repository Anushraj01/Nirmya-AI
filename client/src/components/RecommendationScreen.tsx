import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { extractSymptomSummary, readSelectedSymptoms } from '../utils/bodyMapStorage'

type AnalysisResult = {
  specialty: string
  reasoning: string
  follow_up_question?: string | null
  urgency_tier: 'critical' | 'urgent' | 'routine'
  secondarySuggestions?: string[]
}

type RecommendationState = {
  result?: AnalysisResult
  region?: string | null
  chips?: string[]
  freeText?: string
}

export function RecommendationScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as RecommendationState
  const result = state.result
  const [savedSummary, setSavedSummary] = useState('')

  useEffect(() => {
    if (result) return

    const saved = readSelectedSymptoms<{ freeText?: string; selectedRegions?: Array<{ parentRegion?: string; subRegion?: string | null; severity?: number | null }>; symptoms?: Array<{ parentRegion?: string; subRegion?: string | null; severity?: number | null }> }>()

    if (saved) {
      setSavedSummary(extractSymptomSummary(saved))
    }
  }, [result])

  if (!result) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-[32px] border border-[#E1F5EE] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Recommendation</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1E5B8C]">No recommendation was captured yet.</h1>
          {savedSummary ? (
            <div className="mt-4 rounded-2xl border border-[#E1F5EE] bg-[#F7F9F8] p-4 text-sm text-[#5F5E5A]">
              <p className="font-semibold text-[#1E5B8C]">Saved symptom summary</p>
              <p className="mt-2">{savedSummary}</p>
            </div>
          ) : null}
          <button
            onClick={() => navigate('/patient/symptom-checker/body-map')}
            className="mt-6 rounded-full bg-[#0F6E56] px-4 py-2 font-medium text-white"
          >
            Start again
          </button>
        </div>
      </div>
    )
  }

  const urgencyLabel = result.urgency_tier === 'critical' ? 'Critical care' : result.urgency_tier === 'urgent' ? 'Urgent follow-up' : 'Routine follow-up'
  const urgencyTone = result.urgency_tier === 'critical' ? 'border-[#D85A30] bg-[#FDEDE8]' : result.urgency_tier === 'urgent' ? 'border-[#D85A30] bg-[#FDEDE8]' : 'border-[#E1F5EE] bg-white'

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className={`rounded-[32px] border p-8 shadow-sm ${urgencyTone}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Recommendation</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#E1F5EE] px-3 py-1 text-sm font-medium text-[#0F6E56]">Intake</span>
          <span className="rounded-full bg-[#E1F5EE] px-3 py-1 text-sm font-medium text-[#0F6E56]">Symptoms</span>
          <span className="rounded-full bg-[#0F6E56] px-3 py-1 text-sm font-medium text-white">Recommendation</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#1E5B8C]">{result.specialty}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${result.urgency_tier === 'critical' || result.urgency_tier === 'urgent' ? 'bg-[#D85A30] text-white' : 'bg-[#E1F5EE] text-[#0F6E56]'}`}>
            {urgencyLabel}
          </span>
        </div>
        <p className="mt-4 text-[#5F5E5A]">{result.reasoning}</p>

        {result.follow_up_question ? (
          <div className="mt-4 rounded-2xl border border-[#E1F5EE] bg-[#F7F9F8] p-4 text-sm text-[#1E5B8C]">
            <strong>Suggested question:</strong> {result.follow_up_question}
          </div>
        ) : null}

        {result.secondarySuggestions?.length ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-[#1E5B8C]">Other possible specialists</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#5F5E5A]">
              {result.secondarySuggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/patient/doctors?specialty=${encodeURIComponent(result.specialty)}`)}
            className="rounded-full bg-[#0F6E56] px-4 py-2 font-medium text-white transition hover:bg-[#0b4f3f]"
          >
            Find a doctor
          </button>
          <button
            onClick={() => navigate('/patient/symptom-checker/body-map')}
            className="rounded-full border border-[#1E5B8C] px-4 py-2 font-medium text-[#1E5B8C] transition hover:bg-[#E1F5EE]"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  )
}
