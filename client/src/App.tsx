import { useState, type FormEvent } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MedicalHistoryForm } from './components/MedicalHistoryForm'
import { BodyMapScreen } from './components/BodyMapScreen'
import { RecommendationScreen } from './components/RecommendationScreen'
import { DoctorDiscoveryPage } from './components/DoctorDiscoveryPage'

type Role = 'Patient' | 'Doctor'

type AuthCardProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[#F7F9F8] px-4 py-10 text-[#5F5E5A]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[32px] border border-[#E1F5EE] bg-white p-6 shadow-sm sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Nirmya AI</p>
          <h1 className="text-3xl font-semibold text-[#1E5B8C]">{title}</h1>
          <p className="text-base leading-7">{subtitle}</p>
        </div>
        <div className="w-full max-w-md rounded-3xl border border-[#E1F5EE] bg-[#F7F9F8] p-6 shadow-inner">{children}</div>
      </div>
    </div>
  )
}

function HomePage() {
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen bg-[#F7F9F8] px-6 py-10 text-[#5F5E5A]">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-[#E1F5EE] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Nirmya AI</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#1E5B8C]">AI-assisted doctor booking</h1>
            <p className="mt-3 max-w-2xl text-base leading-7">
              Register, sign in, and manage your care journey with secure patient and doctor flows.
            </p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-[#D85A30] px-4 py-2 font-medium text-white transition hover:bg-[#b94a24]"
            >
              Sign out
            </button>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="rounded-full bg-[#0F6E56] px-4 py-2 font-medium text-white transition hover:bg-[#0b4f3f]">
                Login
              </Link>
              <Link to="/signup" className="rounded-full border border-[#1E5B8C] px-4 py-2 font-medium text-[#1E5B8C] transition hover:bg-[#E1F5EE]">
                Create account
              </Link>
            </div>
          )}
        </div>

        {user ? (
          <div className="mt-8 rounded-2xl bg-[#E1F5EE] p-5">
            <p className="font-semibold text-[#0F6E56]">Signed in as {user.name}</p>
            <p className="mt-1 text-sm">Role: {user.role}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/patient" className="rounded-full bg-[#1E5B8C] px-4 py-2 text-white transition hover:bg-[#163f61]">
                Patient area
              </Link>
              <Link to="/doctor" className="rounded-full border border-[#1E5B8C] px-4 py-2 text-[#1E5B8C] transition hover:bg-white">
                Doctor area
              </Link>
              <Link to="/admin" className="rounded-full border border-[#0F6E56] px-4 py-2 text-[#0F6E56] transition hover:bg-[#E1F5EE]">
                Admin area
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#E1F5EE] p-4">
              <h2 className="font-semibold text-[#1E5B8C]">Patient care</h2>
              <p className="mt-2 text-sm">Book routine appointments and access your medical history.</p>
            </div>
            <div className="rounded-2xl border border-[#E1F5EE] p-4">
              <h2 className="font-semibold text-[#1E5B8C]">Doctor workflows</h2>
              <p className="mt-2 text-sm">Review your approvals and manage your care sessions securely.</p>
            </div>
            <div className="rounded-2xl border border-[#E1F5EE] p-4">
              <h2 className="font-semibold text-[#1E5B8C]">Emergency triage</h2>
              <p className="mt-2 text-sm">Prioritize urgent cases through the dedicated emergency module.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('Patient')
  const [form, setForm] = useState({ email: '', password: '' })
  const [pendingApproval, setPendingApproval] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    setPendingApproval(false)

    try {
      await signIn(form.email, form.password, role)
      navigate(role === 'Doctor' ? '/doctor' : '/patient')
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Unable to sign in'
      if (fallback === 'Account pending admin approval') {
        setPendingApproval(true)
        setMessage('Account pending admin approval')
      } else {
        setMessage(fallback)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue your Nirmya AI care journey.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          {(['Patient', 'Doctor'] as Role[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRole(option)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${role === option ? 'bg-[#0F6E56] text-white' : 'text-[#5F5E5A]'}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        {pendingApproval && (
          <div className="rounded-2xl border border-[#D85A30] bg-[#FDEDE8] px-4 py-3 text-sm text-[#D85A30]">
            Account pending approval
          </div>
        )}

        {message && !pendingApproval && (
          <div className="rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 text-sm text-[#5F5E5A]">{message}</div>
        )}

        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-[#0F6E56] px-4 py-3 font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-70">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-[#1E5B8C]">Forgot password?</Link>
          <Link to="/signup" className="text-[#0F6E56]">Create account</Link>
        </div>
      </form>
    </AuthCard>
  )
}

function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('Patient')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      await register({ ...form, role })
      setMessage(`Welcome to Nirmya AI. Your ${role.toLowerCase()} account is ready.`)
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to register')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join Nirmya AI as a patient or a doctor.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex rounded-full bg-white p-1 shadow-sm">
          {(['Patient', 'Doctor'] as Role[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRole(option)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${role === option ? 'bg-[#0F6E56] text-white' : 'text-[#5F5E5A]'}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Full name</label>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        {message && <div className="rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 text-sm text-[#5F5E5A]">{message}</div>}

        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-[#1E5B8C] px-4 py-3 font-semibold text-white transition hover:bg-[#163f61] disabled:opacity-70">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0F6E56]">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      await forgotPassword(email)
      setMessage('A reset token was generated and logged to the server console for now.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to request reset')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll generate a short-lived token for you and guide you through the reset flow.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        {message && <div className="rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 text-sm text-[#5F5E5A]">{message}</div>}

        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-[#0F6E56] px-4 py-3 font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-70">
          {isSubmitting ? 'Preparing reset...' : 'Send reset token'}
        </button>

        <p className="text-center text-sm">
          <Link to="/login" className="text-[#1E5B8C]">
            Back to login
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', token: searchParams.get('token') ?? '', password: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      await resetPassword(form.email, form.token, form.password)
      setMessage('Password reset complete. You can now sign in again.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard title="Set a new password" subtitle="Enter the reset token from the server console and your new password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">Reset token</label>
          <input
            type="text"
            value={form.token}
            onChange={(event) => setForm((current) => ({ ...current, token: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#1E5B8C]">New password</label>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 outline-none ring-0"
            required
          />
        </div>

        {message && <div className="rounded-2xl border border-[#E1F5EE] bg-white px-4 py-3 text-sm text-[#5F5E5A]">{message}</div>}

        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-[#1E5B8C] px-4 py-3 font-semibold text-white transition hover:bg-[#163f61] disabled:opacity-70">
          {isSubmitting ? 'Saving password...' : 'Reset password'}
        </button>

        <p className="text-center text-sm">
          <Link to="/login" className="text-[#1E5B8C]">
            Back to login
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}

function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] px-6 py-10">
      <div className="mx-auto max-w-xl rounded-[32px] border border-[#E1F5EE] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D85A30]">Access denied</p>
        <h1 className="mt-3 text-2xl font-semibold text-[#1E5B8C]">You do not have permission to view this area.</h1>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-[#0F6E56] px-4 py-2 font-medium text-white">
          Back home
        </Link>
      </div>
    </main>
  )
}

function PatientPage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-[#E1F5EE] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Patient portal</p>
        <h1 className="mt-3 text-2xl font-semibold text-[#1E5B8C]">Patient dashboard</h1>
        <p className="mt-3 text-[#5F5E5A]">Keep your medical history up to date and share reports securely with your care team.</p>
        <button
          type="button"
          onClick={() => {
            window.location.href = '/bodymap/index.html'
          }}
          className="mt-4 inline-flex rounded-full bg-[#0F6E56] px-4 py-2 font-medium text-white transition hover:bg-[#0b4f3f]"
        >
          Check my symptoms
        </button>
        <div className="mt-8">
          <MedicalHistoryForm />
        </div>
      </div>
    </main>
  )
}

function DoctorPage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E1F5EE] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Doctor portal</p>
        <h1 className="mt-3 text-2xl font-semibold text-[#1E5B8C]">Doctor dashboard</h1>
        <p className="mt-3 text-[#5F5E5A]">Doctor approvals and consultation workflows will appear here.</p>
      </div>
    </main>
  )
}

function AdminPage() {
  return (
    <main className="min-h-screen bg-[#F7F9F8] px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#E1F5EE] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0F6E56]">Admin portal</p>
        <h1 className="mt-3 text-2xl font-semibold text-[#1E5B8C]">Admin dashboard</h1>
        <p className="mt-3 text-[#5F5E5A]">Platform moderation and approval management will live here.</p>
      </div>
    </main>
  )
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/patient/symptom-checker" element={<BodyMapScreen />} />
          <Route path="/patient/symptom-checker/body-map" element={<BodyMapScreen />} />
          <Route path="/patient/symptom-checker/recommendation" element={<RecommendationScreen />} />
          <Route path="/patient/doctors" element={<DoctorDiscoveryPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
          <Route path="/doctor" element={<DoctorPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
