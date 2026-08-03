interface CategoryDef {
  id: string
  label: string
  chips: string[]
}

const CATEGORIES: CategoryDef[] = [
  { id: 'head', label: 'Head & Neck', chips: ['Headache', 'Dizziness', 'Blurred vision'] },
  { id: 'chest', label: 'Chest', chips: ['Chest pain', 'Palpitations', 'Tightness'] },
  { id: 'abdomen', label: 'Abdomen', chips: ['Stomach pain', 'Nausea', 'Bloating'] },
  { id: 'arms', label: 'Arms & Shoulders', chips: ['Joint pain', 'Swelling', 'Stiffness'] },
  { id: 'legs', label: 'Legs & Hips', chips: ['Joint pain', 'Swelling', 'Stiffness'] },
]

export type BodyMapGender = 'male' | 'female'

interface BodyMapProps {
  gender: BodyMapGender
  selectedRegion: string | null
  selectedChips: string[]
  onSelectRegion: (regionId: string | null) => void
  onToggleChip: (chip: string) => void
}

function BodyIllustration({ gender, selectedRegion, onSelectRegion }: { gender: BodyMapGender; selectedRegion: string | null; onSelectRegion: (regionId: string | null) => void }) {
  const isSelected = (regionId: string) => selectedRegion === regionId
  const sharedStroke = '#1E5B8C'
  const inactiveFill = '#E1F5EE'
  const activeFill = '#0F6E56'

  return (
    <svg viewBox="0 0 220 480" className="w-full max-w-[16rem]" role="img" aria-label={`Body map illustration for ${gender} gender`}>
      {gender === 'female' ? (
        <>
          <path d="M112 30c14 0 26 10 29 24 4 17-7 33-24 37-16 4-32-4-39-19-7-14-3-33 11-43 6-4 13-6 23-6Z" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <path d="M94 81c-8 8-12 20-12 34v42l-18 30c-7 12-3 27 9 33l16 9c8 4 17 2 24-3l8-7 8 7c7 5 17 7 25 3l16-9c12-6 16-21 9-33l-18-30v-42c0-14-4-26-12-34l-14 6-14-6Z" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <path d="M92 145h34v118h-34z" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <path d="M97 264c-10 12-14 26-14 44v70c0 13 10 23 22 23h15v-60h-9v-77h-14Z" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <path d="M126 264c10 12 14 26 14 44v70c0 13-10 23-22 23h-15v-60h9v-77h14Z" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
        </>
      ) : (
        <>
          <circle cx="110" cy="60" r="28" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <rect x="74" y="95" width="72" height="120" rx="28" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <rect x="58" y="210" width="32" height="120" rx="14" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <rect x="124" y="210" width="32" height="120" rx="14" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <rect x="68" y="330" width="28" height="110" rx="12" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
          <rect x="122" y="330" width="28" height="110" rx="12" fill={inactiveFill} stroke={sharedStroke} strokeWidth="3" />
        </>
      )}

      <g className="cursor-pointer" onClick={() => onSelectRegion('head')}>
        <rect x="82" y="30" width="56" height="60" rx="24" fill={isSelected('head') ? activeFill : 'transparent'} />
      </g>
      <g className="cursor-pointer" onClick={() => onSelectRegion('chest')}>
        <rect x="70" y="90" width="80" height="120" rx="24" fill={isSelected('chest') ? activeFill : 'transparent'} />
      </g>
      <g className="cursor-pointer" onClick={() => onSelectRegion('abdomen')}>
        <rect x="78" y="210" width="64" height="70" rx="20" fill={isSelected('abdomen') ? activeFill : 'transparent'} />
      </g>
      <g className="cursor-pointer" onClick={() => onSelectRegion('arms')}>
        <rect x="34" y="100" width="40" height="150" rx="18" fill={isSelected('arms') ? activeFill : 'transparent'} />
        <rect x="144" y="100" width="40" height="150" rx="18" fill={isSelected('arms') ? activeFill : 'transparent'} />
      </g>
      <g className="cursor-pointer" onClick={() => onSelectRegion('legs')}>
        <rect x="62" y="280" width="34" height="120" rx="12" fill={isSelected('legs') ? activeFill : 'transparent'} />
        <rect x="122" y="280" width="34" height="120" rx="12" fill={isSelected('legs') ? activeFill : 'transparent'} />
      </g>
    </svg>
  )
}

export function BodyMap({ gender, selectedRegion, selectedChips, onSelectRegion, onToggleChip }: BodyMapProps) {
  const activeCategory = CATEGORIES.find((category) => category.id === selectedRegion) ?? null

  return (
    <div>
      <div className="mx-auto flex max-w-xs justify-center rounded-2xl bg-[#F7F9F8] p-3">
        <BodyIllustration gender={gender} selectedRegion={selectedRegion} onSelectRegion={onSelectRegion} />
      </div>

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
      </div>

      {activeCategory && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-[#1E5B8C]">Common symptoms for {activeCategory.label}</p>
          <div className="flex flex-wrap gap-2">
            {activeCategory.chips.map((chip) => (
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
