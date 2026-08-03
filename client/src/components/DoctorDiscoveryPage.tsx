import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

type DoctorCard = {
  id: string
  name: string
  specialty: string
  location: string
  availability: string
}

const doctorSeed: DoctorCard[] = [
  { id: '1', name: 'Dr. Maya Singh', specialty: 'Cardiologist', location: 'Downtown Clinic', availability: 'Today • 4:00 PM' },
  { id: '2', name: 'Dr. Arjun Patel', specialty: 'Dermatologist', location: 'Northside Care', availability: 'Tomorrow • 10:30 AM' },
  { id: '3', name: 'Dr. Sara Gomez', specialty: 'General Physician', location: 'Harbor Medical', availability: 'Today • 6:15 PM' },
  { id: '4', name: 'Dr. Nisha Rao', specialty: 'Dentist', location: 'Smile Point', availability: 'Tomorrow • 9:00 AM' },
  { id: '5', name: 'Dr. Daniel Kim', specialty: 'Orthopedic', location: 'OrthoCare', availability: 'Today • 2:00 PM' },
  { id: '6', name: 'Dr. Isha Verma', specialty: 'Neurologist', location: 'NeuroLink', availability: 'Friday • 11:00 AM' },
]

export function DoctorDiscoveryPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') ?? '')

  useEffect(() => {
    setSelectedSpecialty(searchParams.get('specialty') ?? '')
  }, [searchParams])

  const doctors = useMemo(() => {
    if (!selectedSpecialty) return doctorSeed
    return doctorSeed.filter((doctor) => doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase())
  }, [selectedSpecialty])

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="rounded-[32px] border border-[#E1F5EE] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Doctor discovery</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#1E5B8C]">Find a doctor for your recommended specialty</h1>
        <p className="mt-2 text-[#5F5E5A]">This view is intentionally lightweight for the current MVP and is pre-filtered from the recommendation step.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {['Cardiologist', 'Dermatologist', 'General Physician', 'Dentist', 'Orthopedic', 'Neurologist'].map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedSpecialty === specialty ? 'bg-[#0F6E56] text-white' : 'border border-[#E1F5EE] text-[#1E5B8C] hover:bg-[#E1F5EE]'}`}
            >
              {specialty}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-3xl border border-[#E1F5EE] bg-[#F7F9F8] p-5">
              <h2 className="text-lg font-semibold text-[#1E5B8C]">{doctor.name}</h2>
              <p className="mt-1 text-sm text-[#5F5E5A]">{doctor.specialty}</p>
              <p className="mt-3 text-sm text-[#5F5E5A]">{doctor.location}</p>
              <p className="mt-1 text-sm font-medium text-[#0F6E56]">{doctor.availability}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/patient/symptom-checker/recommendation')}
          className="mt-8 rounded-full border border-[#1E5B8C] px-4 py-2 font-medium text-[#1E5B8C]"
        >
          Back to recommendation
        </button>
      </div>
    </div>
  )
}
