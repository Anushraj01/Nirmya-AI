import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

type SectionKey = 'conditions' | 'allergies' | 'medications' | 'familyHistory'

type SectionConfig = {
  key: SectionKey
  title: string
  description: string
}

const sections: SectionConfig[] = [
  { key: 'conditions', title: 'Conditions', description: 'Current diagnoses or ongoing medical conditions.' },
  { key: 'allergies', title: 'Allergies', description: 'Known allergies, reactions, or triggers to note.' },
  { key: 'medications', title: 'Medications', description: 'Prescriptions, supplements, or daily treatments.' },
  { key: 'familyHistory', title: 'Family history', description: 'Relevant inherited conditions and family health history.' },
]

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
})

export function MedicalHistoryForm() {
  const { accessToken } = useAuth()
  const [form, setForm] = useState<Record<SectionKey, string[]>>({
    conditions: [''],
    allergies: [''],
    medications: [''],
    familyHistory: [''],
  })
  const [reportUrls, setReportUrls] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadHistory = async () => {
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const response = await api.get('/patient/medical-history', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        const payload = response.data?.data
        if (payload) {
          setForm({
            conditions: payload.conditions?.length ? payload.conditions : [''],
            allergies: payload.allergies?.length ? payload.allergies : [''],
            medications: payload.medications?.length ? payload.medications : [''],
            familyHistory: payload.familyHistory?.length ? payload.familyHistory : [''],
          })
          setReportUrls(payload.reportUrls || [])
        }
      } catch {
        setMessage('Unable to load your current medical history right now.')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [accessToken])

  const updateSectionValue = (key: SectionKey, index: number, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }))
  }

  const addSectionItem = (key: SectionKey) => {
    setForm((current) => ({ ...current, [key]: [...current[key], ''] }))
  }

  const removeSectionItem = (key: SectionKey, index: number) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!consent) {
      setMessage('Please confirm that you want to share this information with authorized care providers.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      await api.post(
        '/patient/medical-history',
        {
          conditions: form.conditions.filter(Boolean),
          allergies: form.allergies.filter(Boolean),
          medications: form.medications.filter(Boolean),
          familyHistory: form.familyHistory.filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      setMessage('Medical history saved successfully.')
    } catch {
      setMessage('Unable to save your medical history right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadFile = async (file: File) => {
    if (!accessToken) {
      return
    }

    const data = new FormData()
    data.append('report', file)

    try {
      const response = await api.post('/patient/medical-history/upload-report', data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      setReportUrls(response.data?.data?.reportUrls || [])
      setMessage('Report uploaded successfully.')
    } catch {
      setMessage('Unable to upload your report right now.')
    }
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const droppedFiles = Array.from(event.dataTransfer.files)
    if (droppedFiles.length) {
      await uploadFile(droppedFiles[0])
    }
  }

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length) {
      await uploadFile(selectedFiles[0])
    }
  }

  if (isLoading) {
    return <p className="text-sm text-[#5F5E5A]">Loading your medical history…</p>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#E1F5EE] bg-[#F7F9F8] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Medical history</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1E5B8C]">Keep your care team informed</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5F5E5A]">
              Share structured health information securely with only the people who are authorized to see it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full border border-[#1E5B8C] px-4 py-2 text-sm font-medium text-[#1E5B8C] transition hover:bg-white"
          >
            Who can see this?
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[24px] border border-[#E1F5EE] bg-white p-6 shadow-sm">
        {message && <div className="rounded-2xl border border-[#E1F5EE] bg-[#F7F9F8] px-4 py-3 text-sm text-[#5F5E5A]">{message}</div>}

        {sections.map((section) => (
          <div key={section.key} className="rounded-[20px] border border-[#E1F5EE] bg-[#F7F9F8] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#1E5B8C]">{section.title}</h3>
                <p className="mt-1 text-sm text-[#5F5E5A]">{section.description}</p>
              </div>
              <button type="button" onClick={() => addSectionItem(section.key)} className="rounded-full bg-[#0F6E56] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0b4f3f]">
                Add {section.title.toLowerCase()}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {form[section.key].map((item, index) => (
                <div key={`${section.key}-${index}`} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(event) => updateSectionValue(section.key, index, event.target.value)}
                    placeholder={`Enter ${section.title.toLowerCase()}...`}
                    className="flex-1 rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none"
                  />
                  {form[section.key].length > 1 && (
                    <button type="button" onClick={() => removeSectionItem(section.key, index)} className="rounded-2xl border border-[#D85A30] px-3 py-2 text-sm font-medium text-[#D85A30]">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-[20px] border border-[#E1F5EE] bg-[#F7F9F8] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#1E5B8C]">Upload medical reports</h3>
              <p className="mt-1 text-sm text-[#5F5E5A]">Drop a scan, lab result, or prescription here for secure storage.</p>
            </div>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`mt-4 rounded-[20px] border-2 border-dashed px-4 py-8 text-center transition ${dragActive ? 'border-[#0F6E56] bg-[#E1F5EE]' : 'border-[#E1F5EE] bg-white'}`}
          >
            <p className="text-sm font-medium text-[#1E5B8C]">Drag and drop a report file here</p>
            <p className="mt-2 text-sm text-[#5F5E5A]">or browse your device to upload it securely.</p>
            <label className="mt-4 inline-flex cursor-pointer rounded-full bg-[#1E5B8C] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#163f61]">
              Choose file
              <input type="file" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          {reportUrls.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {reportUrls.map((url, index) => (
                <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-2xl border border-[#E1F5EE] bg-white p-4 text-left shadow-sm">
                  <p className="font-medium text-[#1E5B8C]">Report {index + 1}</p>
                  <p className="mt-2 text-sm text-[#5F5E5A]">Open uploaded document</p>
                </a>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-[20px] border border-[#E1F5EE] bg-[#F7F9F8] p-4 text-sm text-[#5F5E5A]">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 rounded border-[#0F6E56] text-[#0F6E56]" />
          <span>
            I consent to sharing this information with authorized care providers who are permitted to see my medical history.
          </span>
        </label>

        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-[#0F6E56] px-4 py-3 font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-70">
          {isSubmitting ? 'Saving...' : 'Save medical history'}
        </button>
      </form>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[24px] border border-[#E1F5EE] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Who can see this?</p>
                <h3 className="mt-2 text-xl font-semibold text-[#1E5B8C]">Access is limited to the people who need it</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-[#E1F5EE] px-3 py-2 text-sm text-[#5F5E5A]">
                Close
              </button>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[#5F5E5A]">
              <p>Your medical history is visible only to you, or to a doctor who has an active confirmed or completed appointment with you.</p>
              <p>This helps keep sensitive health information private while still allowing your care team to support you safely.</p>
              <p>If a doctor is not part of your active care team, they cannot view this information.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
