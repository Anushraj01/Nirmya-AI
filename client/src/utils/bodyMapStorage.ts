export const BODY_MAP_STORAGE_KEY = 'nirmya_selected_symptoms'

export type BodyMapSelection = {
  parentRegion?: string
  subRegion?: string | null
  regionId?: string
  side?: 'front' | 'back'
  severity?: number | null
  note?: string
  view?: 'front' | 'back'
}

export type BodyMapStoragePayload = BodyMapSelection[] | {
  selections?: BodyMapSelection[]
  selectedSymptoms?: BodyMapSelection[]
  symptoms?: BodyMapSelection[]
  symptomData?: BodyMapSelection[]
}

function isBodyMapSelectionArray(value: unknown): value is BodyMapSelection[] {
  return Array.isArray(value)
}

function getStorageArray(data: unknown): BodyMapSelection[] {
  if (isBodyMapSelectionArray(data)) {
    return data
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  const payload = data as Record<string, unknown>

  const candidate =
    payload.selections ??
    payload.selectedSymptoms ??
    payload.symptoms ??
    payload.symptomData

  return isBodyMapSelectionArray(candidate) ? candidate : []
}

export function saveSelectedSymptoms(symptomsData: unknown) {
  localStorage.setItem(BODY_MAP_STORAGE_KEY, JSON.stringify(symptomsData))
}

export function readSelectedSymptoms<T = unknown>(): T | null {
  try {
    const raw = localStorage.getItem(BODY_MAP_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearSelectedSymptoms() {
  localStorage.removeItem(BODY_MAP_STORAGE_KEY)
}

export function extractSymptomSummary(data: unknown): string {
  const list = getStorageArray(data)

  if (!Array.isArray(list) || list.length === 0) {
    return ''
  }

  return list
    .map((item) => {
      const typed = item as BodyMapSelection
      const region = typed.parentRegion ?? typed.regionId ?? 'Body area'
      const sub = typed.subRegion ? ` / ${typed.subRegion}` : ''
      const severity = typed.severity ? ` • severity ${typed.severity}` : ''
      return `${region}${sub}${severity}`
    })
    .join(', ')
}
