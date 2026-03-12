import type { FormEvent } from 'react'
import { useState } from 'react'
import logoMark from './assets/startiqo-logo.svg'
import './App.css'
import AdminDashboard from './admin/AdminDashboard.tsx'
import AdminUsers from './admin/AdminUsers.tsx'
import AdminApplications from './admin/AdminApplications.tsx'
import AdminAnalytics from './admin/AdminAnalytics.tsx'
import AdminSettings from './admin/AdminSettings.tsx'

type InputField = {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password'
  required?: boolean
  placeholder?: string
  as?: 'input' | 'textarea'
}

const HOME_PATH = '/'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_TOKEN_KEY = 'startiq_auth_token'

const lifecycleSteps = [
  {
    number: '01',
    title: 'Application',
    description:
      'Submit your role-specific application. Founders, investors, and agencies each have tailored forms.',
  },
  {
    number: '02',
    title: 'Verification',
    description:
      'Profile and LinkedIn verification. Optional document verification for enhanced credibility.',
  },
  {
    number: '03',
    title: 'Evaluation',
    description:
      'Founders receive a Readiness Score (0–100) based on market clarity, traction, team, and financials.',
  },
  {
    number: '04',
    title: 'Matching',
    description:
      'Algorithm matches startups with investors by stage, sector, ticket size, and geography.',
  },
  {
    number: '05',
    title: 'Introduction',
    description:
      'Both parties authorize the connection. Contact details are unlocked simultaneously.',
  },
]

const benefits = [
  {
    title: 'Verification-First',
    description:
      'Every participant is verified. LinkedIn, documents, and profile checks ensure only serious players enter the ecosystem.',
  },
  {
    title: 'Noise Reduction',
    description:
      'Controlled Q&A replaces cold outreach. Interact through structured channels before any introduction.',
  },
  {
    title: 'Readiness Scoring',
    description:
      'Founders receive a 0–100 score across market clarity, traction, team strength, scalability, and financials.',
  },
  {
    title: 'Curated Matching',
    description:
      'Algorithm-driven matching by stage, sector, ticket size, and geography. Quality over quantity.',
  },
  {
    title: 'Gated Introductions',
    description:
      'Contact details unlock only when both parties authorize. No spam, no unsolicited pitches.',
  },
  {
    title: 'Lifecycle Tracking',
    description:
      'Track progress from application to funding. Clear stages, binary progression, full transparency.',
  },
]

const founderFields: InputField[] = [
  { label: 'Full Name', name: 'fullName', required: true },
  { label: 'Email', name: 'email', type: 'email', required: true },
  { label: 'Phone Number', name: 'phone', type: 'tel', required: true },
  { label: 'Company / Startup Name', name: 'companyName', required: true },
  { label: 'Website', name: 'website', type: 'url' },
  { label: 'LinkedIn Profile', name: 'linkedin', type: 'url', required: true },
  { label: 'Sector / Industry', name: 'sector', required: true },
  { label: 'Funding Stage', name: 'fundingStage', required: true },
  { label: 'Amount Seeking (INR)', name: 'amountSeeking', type: 'number', required: true },
  {
    label: 'Brief Pitch',
    name: 'pitch',
    required: true,
    as: 'textarea',
    placeholder: 'Summarize your startup, traction, and use of funds.',
  },
]

const investorFields: InputField[] = [
  { label: 'Full Name', name: 'fullName', required: true },
  { label: 'Email', name: 'email', type: 'email', required: true },
  { label: 'Phone Number', name: 'phone', type: 'tel', required: true },
  { label: 'Firm / Organization', name: 'organization' },
  { label: 'LinkedIn Profile', name: 'linkedin', type: 'url', required: true },
  { label: 'Investor Type', name: 'investorType', required: true },
  { label: 'Sectors of Interest', name: 'sectors', required: true },
  { label: 'Typical Ticket Size (INR)', name: 'ticketSize', required: true },
  { label: 'Stage Preference', name: 'stagePreference', required: true },
  {
    label: 'Why Startiqo?',
    name: 'whyStartiqo',
    required: true,
    as: 'textarea',
    placeholder: 'Tell us what kind of opportunities you are looking for.',
  },
]

const agencyFields: InputField[] = [
  { label: 'Contact Person Name', name: 'contactName', required: true },
  { label: 'Email', name: 'email', type: 'email', required: true },
  { label: 'Phone Number', name: 'phone', type: 'tel', required: true },
  { label: 'Agency / Firm Name', name: 'firmName', required: true },
  { label: 'Website', name: 'website', type: 'url' },
  { label: 'LinkedIn Profile', name: 'linkedin', type: 'url', required: true },
  { label: 'Service Type', name: 'serviceType', required: true },
  { label: 'Regions Served', name: 'regions', required: true },
  { label: 'Years of Experience', name: 'yearsExperience', type: 'number', required: true },
  {
    label: 'About Your Services',
    name: 'services',
    required: true,
    as: 'textarea',
    placeholder: 'Describe your core services and startup support expertise.',
  },
]

function App() {
  const path = window.location.pathname
  const isLoggedIn = isUserLoggedIn()

  // Admin routes
  if ((path === '/admin' || path === '/admin/') && !isLoggedIn) {
    return <AdminLoginRequiredPage requestedPath="/admin" />
  }

  if (path === '/admin' || path === '/admin/') {
    return <AdminDashboard />
  }

  if (path === '/admin/users' && !isLoggedIn) {
    return <AdminLoginRequiredPage requestedPath="/admin/users" />
  }

  if (path === '/admin/users') {
    return <AdminUsers />
  }

  if (path === '/admin/applications' && !isLoggedIn) {
    return <AdminLoginRequiredPage requestedPath="/admin/applications" />
  }

  if (path === '/admin/applications') {
    return <AdminApplications />
  }

  if (path === '/admin/analytics' && !isLoggedIn) {
    return <AdminLoginRequiredPage requestedPath="/admin/analytics" />
  }

  if (path === '/admin/analytics') {
    return <AdminAnalytics />
  }

  if (path === '/admin/settings' && !isLoggedIn) {
    return <AdminLoginRequiredPage requestedPath="/admin/settings" />
  }

  if (path === '/admin/settings') {
    return <AdminSettings />
  }

  if (path === '/apply/founder') {
    return <ApplicationPage role="Founder" fields={founderFields} />
  }

  if (path === '/apply/investor') {
    return <ApplicationPage role="Investor" fields={investorFields} />
  }

  if (path === '/apply/agency') {
    return <ApplicationPage role="Agency" fields={agencyFields} />
  }

  if (path === '/login') {
    return <LoginPage />
  }

  if (path === '/signup') {
    return <SignupPage />
  }

  if (path === '/privacy' || path === '/terms' || path === '/contact') {
    return <NotFoundPage />
  }

  if (path !== HOME_PATH) {
    return <NotFoundPage />
  }

  return (
    <div className="home-page">
      <AppHeader />

      <main className="home-main">
        <section className="hero">
          <p className="eyebrow">VERIFICATION-FIRST FUNDING ECOSYSTEM</p>
          <h1>
            The Trust Layer of <span>Startup Capital</span>
          </h1>
          <p className="lead">
            Startiqo connects verified founders with qualified investors through structured screening,
            readiness scoring, and curated introductions. No noise. Only signal.
          </p>
          <div className="cta-group">
            <a href="/apply/founder" className="button primary">
              Apply as Founder
            </a>
            <a href="/apply/investor" className="button outline">
              Apply as Investor
            </a>
            <a href="/apply/agency" className="button link-btn">
              Apply as Agency
            </a>
          </div>
          <ul className="stats">
            <li>100% Verified Profiles</li>
            <li>0–100 Readiness Score</li>
            <li>Curated Introductions</li>
          </ul>
        </section>

        <section id="how-it-works" className="section lifecycle-section">
          <h2>The Funding Lifecycle</h2>
          <p className="section-lead">
            A linear, sequential process. Each step is a gate that must be unlocked.
          </p>
          <ol className="lifecycle-timeline" aria-label="Funding lifecycle steps">
            {lifecycleSteps.map((step) => (
              <li key={step.number} className="timeline-item">
                <span className="timeline-dot">{step.number}</span>
                <div className="timeline-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="benefits" className="section">
          <h2>Built for Trust</h2>
          <p className="section-lead">
            Every feature exists to increase signal and eliminate noise in the funding process.
          </p>
          <div className="card-grid benefits-grid">
            {benefits.map((item) => (
              <article key={item.title} className="info-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="apply" className="section">
          <h2>Enter the Ecosystem</h2>
          <p className="section-lead">Choose your role. Applications are reviewed before approval.</p>
          <div className="card-grid roles-grid">
            <article className="info-card role-card">
              <h3>Founders</h3>
              <p>
                Get your startup evaluated, scored, and matched with the right investors. Access
                structured fundraising.
              </p>
              <a href="/apply/founder" className="button primary">
                Apply as Founder
              </a>
            </article>
            <article className="info-card role-card">
              <h3>Investors</h3>
              <p>
                Receive curated, pre-screened deal flow. Interact through controlled Q&amp;A before
                committing to introductions.
              </p>
              <a href="/apply/investor" className="button primary">
                Apply as Investor
              </a>
            </article>
            <article className="info-card role-card">
              <h3>Agencies</h3>
              <p>
                Access verified startup leads for grant consulting, subsidy advising, and debt
                financing facilitation.
              </p>
              <a href="/apply/agency" className="button primary">
                Apply as Agency
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a href="/" className="footer-brand" aria-label="Startiqo home">
          <img src={logoMark} alt="Startiqo logo" className="footer-brand-mark" />
          <span>Startiqo</span>
        </a>
        <p>
          Startiqo operates as a structured introduction and evaluation platform. We are not a
          broker, investment advisor, or fund manager. All transactions occur independently between
          parties.
        </p>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}

function AppHeader({ minimal = false }: { minimal?: boolean }) {
  const user = getLoggedInUser()

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem('startiq_user')
    window.location.href = '/'
  }

  return (
    <header className="topbar-wrap">
      <div className="topbar">
        <a href="/" className="brand" aria-label="Startiqo home">
          <img src={logoMark} alt="Startiqo logo" className="brand-mark" />
          <span>Startiqo</span>
        </a>

        {!minimal ? (
          <>
            <nav className="topnav" aria-label="Primary">
              <a href="/#how-it-works">How It Works</a>
              <a href="/#benefits">Benefits</a>
              <a href="/#apply">Apply</a>
              <a href={user ? '/admin' : '/login?next=%2Fadmin'}>Admin</a>
            </nav>
            <div className="top-actions">
              {user ? (
                <>
                  <span className="top-user-name">{user.fullName}</span>
                  <button type="button" className="button top-apply" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="top-login">
                    Login
                  </a>
                  <a href="/apply/founder" className="button top-apply">
                    Apply Now
                  </a>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}

function ApplicationPage({ role, fields }: { role: 'Founder' | 'Investor' | 'Agency'; fields: InputField[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const payload = Object.fromEntries(formData.entries())

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${role.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to submit application.')
      }

      window.alert(`${data.message}\nApplication ID: ${data.applicationId}`)
      formElement.reset()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to submit application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="route-page">
      <AppHeader minimal />
      <main className="route-main">
        <div className="route-shell">
          <a href="/" className="back-link">
            ← Back
          </a>
          <h1>{role} Application</h1>
          <p>All applications are reviewed before approval. Complete all required fields.</p>

          <form className="form-grid" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <label key={field.name} className={field.as === 'textarea' ? 'field full' : 'field'}>
                <span>
                  {field.label}
                  {field.required ? '*' : ''}
                </span>
                {field.as === 'textarea' ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder ?? ''}
                    rows={5}
                  />
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    name={field.name}
                    required={field.required}
                    placeholder={field.placeholder ?? ''}
                  />
                )}
              </label>
            ))}
            <button type="submit" className="button primary full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const nextPath = new URLSearchParams(window.location.search).get('next')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const payload = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    }

    setIsLoggingIn(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Login failed.')
      }

      if (typeof data.token === 'string') {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      }

      if (data.user) {
        localStorage.setItem('startiq_user', JSON.stringify(data.user))
      }

      if (nextPath && nextPath.startsWith('/')) {
        window.location.href = nextPath
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      if (message.toLowerCase().includes('failed to fetch')) {
        window.alert('Cannot reach authentication server. Start backend with npm run dev:server (or npm run dev:full).')
      } else {
        window.alert(message)
      }
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="route-page">
      <AppHeader minimal />
      <main className="route-main auth-main">
        <div className="route-shell compact auth-shell">
          <h1>Welcome back</h1>
          <p>Login to access your dashboard</p>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field full">
              <span>Email</span>
              <input type="email" name="email" required placeholder="you@company.com" />
            </label>
            <label className="field full">
              <span>Password</span>
              <input type="password" name="password" required placeholder="••••••••" />
            </label>
            <button type="submit" className="button primary full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="tiny-text">
            Don&apos;t have an account? <a href="/signup">Create one</a>
          </p>
        </div>
      </main>
    </div>
  )
}

function SignupPage() {
  const [isRegistering, setIsRegistering] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formElement = event.currentTarget
    const formData = new FormData(formElement)

    const fullName = String(formData.get('fullName') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      window.alert('Passwords do not match.')
      return
    }

    setIsRegistering(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message ?? 'Registration failed.')
      }

      if (typeof data.token === 'string') {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token)
      }

      window.alert(`${data.message}\nYou can now use your credentials to log in.`)
      window.location.href = '/login'
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.'
      if (message.toLowerCase().includes('failed to fetch')) {
        window.alert('Cannot reach authentication server. Start backend with npm run dev:server (or npm run dev:full).')
      } else {
        window.alert(message)
      }
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="route-page">
      <AppHeader minimal />
      <main className="route-main auth-main">
        <div className="route-shell compact auth-shell">
          <h1>Create account</h1>
          <p>Register to access your dashboard</p>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field full">
              <span>Full Name</span>
              <input type="text" name="fullName" required placeholder="Your full name" />
            </label>
            <label className="field full">
              <span>Email</span>
              <input type="email" name="email" required placeholder="you@company.com" />
            </label>
            <label className="field full">
              <span>Password</span>
              <input type="password" name="password" required minLength={8} placeholder="Minimum 8 characters" />
            </label>
            <label className="field full">
              <span>Confirm Password</span>
              <input type="password" name="confirmPassword" required minLength={8} placeholder="Re-enter password" />
            </label>
            <button type="submit" className="button primary full" disabled={isRegistering}>
              {isRegistering ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="tiny-text">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </main>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="route-page">
      <AppHeader minimal />
      <main className="route-main">
        <div className="route-shell compact">
          <h1>404</h1>
          <p>Oops! Page not found</p>
          <a href="/" className="button primary">
            Return to Home
          </a>
        </div>
      </main>
    </div>
  )
}

function AdminLoginRequiredPage({ requestedPath }: { requestedPath: string }) {
  return (
    <div className="route-page">
      <AppHeader minimal />
      <main className="route-main auth-main">
        <div className="route-shell compact auth-shell">
          <h1>Admin login required</h1>
          <p>Please login first to open the admin panel.</p>
          <a className="button primary full" href={`/login?next=${encodeURIComponent(requestedPath)}`}>
            Go to Login
          </a>
          <p className="tiny-text">
            Tip: after login, you will be redirected back automatically.
          </p>
        </div>
      </main>
    </div>
  )
}

function isUserLoggedIn() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const user = getLoggedInUser()
  return Boolean(token && user)
}

function getLoggedInUser(): { fullName?: string; email?: string } | null {
  const raw = localStorage.getItem('startiq_user')

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as { fullName?: string; email?: string } : null
  } catch {
    return null
  }
}

export default App
