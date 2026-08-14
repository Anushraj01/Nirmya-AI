import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { InteractiveBodyMap, type BodyRegion } from './InteractiveBodyMap'

const api = axios.create({ baseURL: 'http://localhost:5000/api', withCredentials: true })

type SymptomAction = 'rule' | 'ai'

export function BodyMapScreen() {
  const [age, setAge] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<BodyRegion[]>([])
  const [freeText, setFreeText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const { accessToken } = useAuth()

  // Derive primary region for backward compatibility
  const selectedRegion = selectedRegions.length > 0 ? selectedRegions[0].parentRegion : null

  const canSubmit = Boolean(freeText.trim() || selectedRegion)

  const handleSubmit = async (action: SymptomAction) => {
    if (!canSubmit) return

    const normalizedAge = age.trim()
    const payload = {
      symptomsText: freeText.trim(),
      bodyRegion: selectedRegion,
      selectedRegions: selectedRegions,
      age: normalizedAge ? Number(normalizedAge) : undefined,
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const endpoint = action === 'rule' ? 'ai/recommend-symptoms' : 'ai/analyze-symptoms'
      const response = await api.post(endpoint, payload, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to get a recommendation')
      }

      navigate('/patient/symptom-checker/recommendation', {
        state: {
          result: response.data?.data,
          region: selectedRegion,
          regions: selectedRegions,
          freeText: freeText.trim(),
          age: normalizedAge,
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to get a recommendation'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl gap-8 p-6">
      <div className="rounded-[32px] border border-[#E1F5EE] bg-white p-6 shadow-sm md:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Symptom checker</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#1E5B8C]">Share a few details and we will guide the next step</h1>
        <p className="mt-2 max-w-2xl text-[#5F5E5A]">
          Interact with the body map to identify affected regions. Add free-text details about your symptoms and we'll recommend the next steps.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#0F6E56] px-3 py-1 text-sm font-medium text-white">Intake</span>
          <span className="rounded-full border border-[#E1F5EE] px-3 py-1 text-sm font-medium text-[#1E5B8C]">Body Selection</span>
          <span className="rounded-full border border-[#E1F5EE] px-3 py-1 text-sm font-medium text-[#1E5B8C]">Recommendation</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="rounded-3xl border border-[#E1F5EE] bg-[#F7F9F8] p-4 shadow-sm">
              <div className="grid gap-4 md:grid-cols-1">
                <label className="space-y-2 text-sm font-medium text-[#1E5B8C]">
                  <span>Age (optional)</span>
                  <input
                    type="number"
                    min="0"
                    value={age}
                    onChange={(event) => setAge(event.target.value)}
                    className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 text-sm outline-none"
                    placeholder="e.g. 32"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-2xl border border-[#E1F5EE] bg-white p-3 text-sm text-[#5F5E5A]">
                <p className="font-semibold text-[#1E5B8C]">Interactive Body Map</p>
                <p className="mt-1">Click on any region to select it. Toggle between Front and Back views to map all affected areas.</p>
              </div>
            </div>

            <div className="mt-4">
              <InteractiveBodyMap
                selectedRegions={selectedRegions}
                onSelectRegion={setSelectedRegions}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#E1F5EE] bg-[#F7F9F8] p-6">
            <h2 className="text-lg font-semibold text-[#1E5B8C]">How this works</h2>
            <div className="mt-4 space-y-3 text-sm text-[#5F5E5A]">
              <p>1. Share your age (optional) to personalize guidance.</p>
              <p>2. Select affected body regions on the interactive map.</p>
              <p>3. Describe your symptoms in detail below.</p>
              <p>4. Get a fast recommendation or deeper AI analysis.</p>
            </div>

            <label className="mt-6 mb-2 block text-sm font-medium text-[#1E5B8C]">Describe your symptoms</label>
            <textarea
              value={freeText}
              onChange={(event) => setFreeText(event.target.value)}
              placeholder="Example: sudden chest tightness, severe pain, started 20 minutes ago..."
              rows={6}
              className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 text-sm outline-none"
            />

            <div className="mt-4 rounded-2xl border border-[#E1F5EE] bg-white p-4 text-sm text-[#5F5E5A]">
              <p className="font-semibold text-[#1E5B8C]">Current selection</p>
              <p className="mt-2">Regions: {selectedRegions.length ? selectedRegions.map(r => r.parentRegion).join(', ') : 'Not selected'}</p>
              <p className="mt-1">Symptoms provided: {freeText.trim() ? 'Yes' : 'No'}</p>
            </div>

            {errorMessage ? <div className="mt-4 rounded-2xl border border-[#D85A30] bg-[#FDEDE8] px-4 py-3 text-sm text-[#D85A30]">{errorMessage}</div> : null}

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => void handleSubmit('rule')}
                disabled={!canSubmit || isLoading}
                className="w-full rounded-2xl bg-[#0F6E56] px-4 py-3 font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-50"
              >
                {isLoading ? 'Working...' : 'Get Recommendation'}
              </button>
              <button
                onClick={() => void handleSubmit('ai')}
                disabled={!canSubmit || isLoading}
                className="w-full rounded-2xl border border-[#1E5B8C] px-4 py-3 font-semibold text-[#1E5B8C] transition hover:bg-[#E1F5EE] disabled:opacity-50"
              >
                {isLoading ? 'Working...' : 'Try AI Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
