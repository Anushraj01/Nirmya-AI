import { useMemo } from 'react'
import Model, { type IExerciseData, type IMuscleStats, type Muscle } from 'react-body-highlighter'

interface CategoryDef {
  id: string
  label: string
  chips: string[]
  muscles: Muscle[] // slugs recognized by react-body-highlighter
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'head',
    label: 'Head & Neck',
    chips: ['Headache', 'Dizziness', 'Blurred vision'],
    muscles: ['head', 'neck'],
  },
  {
    id: 'chest',
    label: 'Chest',
    chips: ['Chest pain', 'Palpitations', 'Tightness'],
    muscles: ['chest'],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    chips: ['Stomach pain', 'Nausea', 'Bloating'],
    muscles: ['abs', 'obliques'],
  },
  {
    id: 'arms',
    label: 'Arms & Shoulders',
    chips: ['Joint pain', 'Swelling', 'Stiffness'],
    muscles: ['biceps', 'triceps', 'forearm', 'front-deltoids', 'back-deltoids', 'trapezius'],
  },
  {
    id: 'legs',
    label: 'Legs & Hips',
    chips: ['Joint pain', 'Swelling', 'Stiffness'],
    muscles: ['quadriceps', 'hamstring', 'calves', 'adductor', 'abductors', 'gluteal'],
  },
]

const SKIN_CHIPS = ['Rash', 'Itching', 'Redness']

// Reverse lookup: library muscle slug -> our symptom category id
const muscleToCategory: Record<string, string> = {}
CATEGORIES.forEach((category) => {
  category.muscles.forEach((muscle) => {
    muscleToCategory[muscle] = category.id
  })
})

interface BodyMapProps {
  selectedRegion: string | null
  selectedChips: string[]
  onSelectRegion: (regionId: string | null) => void
  onToggleChip: (chip: string) => void
}

export function BodyMap({ selectedRegion, selectedChips, onSelectRegion, onToggleChip }: BodyMapProps) {
  const activeCategory = CATEGORIES.find((category) => category.id === selectedRegion) ?? null
  const isSkinSelected = selectedRegion === 'skin'

  const highlightData: IExerciseData[] = useMemo(() => {
    if (!activeCategory) return []
    return [{ name: activeCategory.label, muscles: activeCategory.muscles }]
  }, [activeCategory])

  const handleModelClick = ({ muscle }: IMuscleStats) => {
    const categoryId = muscleToCategory[muscle]
    if (categoryId) onSelectRegion(categoryId)
  }

  const activeChips = isSkinSelected ? SKIN_CHIPS : activeCategory?.chips ?? []
  const activeLabel = isSkinSelected ? 'Skin' : activeCategory?.label ?? ''

  return (
    <div>
      <div className="mx-auto flex max-w-xs justify-center rounded-2xl bg-[#F7F9F8] p-3">
        <Model data={highlightData} onClick={handleModelClick} style={{ width: '14rem' }} />
      </div>

      {/* Accessible text-list fallback — always available, not click-only */}
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Body regions (list view)">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectRegion(category.id)}
            aria-pressed={selectedRegion === category.id}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              selectedRegion === category.id
                ? 'border-[#0F6E56] bg-[#0F6E56] text-white'
                : 'border-[#E1F5EE] text-[#5F5E5A] hover:bg-[#E1F5EE]'
            }`}
          >
            {category.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSelectRegion('skin')}
          aria-pressed={isSkinSelected}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            isSkinSelected
              ? 'border-[#0F6E56] bg-[#0F6E56] text-white'
              : 'border-[#E1F5EE] text-[#5F5E5A] hover:bg-[#E1F5EE]'
          }`}
        >
          Skin (general)
        </button>
      </div>

      {(activeCategory || isSkinSelected) && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-[#1E5B8C]">Common symptoms for {activeLabel}</p>
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onToggleChip(chip)}
                aria-pressed={selectedChips.includes(chip)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedChips.includes(chip)
                    ? 'border-[#1E5B8C] bg-[#1E5B8C] text-white'
                    : 'border-[#E1F5EE] text-[#5F5E5A] hover:bg-[#E1F5EE]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}