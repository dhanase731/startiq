import cors from 'cors'
import express from 'express'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = Number(process.env.PORT) || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const applicationsFile = path.join(dataDir, 'applications.json')

const requiredFieldsByRole = {
  founder: ['fullName', 'email', 'phone', 'companyName', 'linkedin', 'sector', 'fundingStage', 'amountSeeking', 'pitch'],
  investor: ['fullName', 'email', 'phone', 'linkedin', 'investorType', 'sectors', 'ticketSize', 'stagePreference', 'whyStartiqo'],
  agency: ['contactName', 'email', 'phone', 'firmName', 'linkedin', 'serviceType', 'regions', 'yearsExperience', 'services'],
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'startiq-backend', timestamp: new Date().toISOString() })
})

app.post('/api/applications/:role', async (req, res) => {
  const role = String(req.params.role || '').toLowerCase()

  if (!Object.hasOwn(requiredFieldsByRole, role)) {
    return res.status(400).json({ message: 'Invalid role. Use founder, investor, or agency.' })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const missingFields = requiredFieldsByRole[role].filter((field) => {
    const value = body[field]
    return value === undefined || value === null || String(value).trim() === ''
  })

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Missing required fields.',
      missingFields,
    })
  }

  const storedPayload = Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  )

  const record = {
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    payload: storedPayload,
    status: 'received',
    submittedAt: new Date().toISOString(),
  }

  const applications = await readApplications()
  applications.push(record)
  await writeApplications(applications)

  return res.status(201).json({
    message: `${role[0].toUpperCase()}${role.slice(1)} application submitted successfully.`,
    applicationId: record.id,
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const normalizedPassword = String(password)

  if (normalizedEmail === 'admin@startiqo.com' && normalizedPassword === 'password123') {
    return res.json({
      message: 'Login successful.',
      token: `demo_token_${Date.now()}`,
      user: {
        email: normalizedEmail,
        role: 'admin',
      },
    })
  }

  return res.status(401).json({ message: 'Invalid credentials.' })
})

app.get('/api/applications', async (req, res) => {
  const role = typeof req.query.role === 'string' ? req.query.role.toLowerCase() : undefined
  const applications = await readApplications()

  if (!role) {
    return res.json({ total: applications.length, items: applications })
  }

  const filtered = applications.filter((item) => item.role === role)
  return res.json({ total: filtered.length, items: filtered })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error.' })
})

app.listen(PORT, () => {
  console.log(`Startiq backend running on http://localhost:${PORT}`)
})

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true })

  try {
    await readFile(applicationsFile, 'utf-8')
  } catch {
    await writeFile(applicationsFile, '[]', 'utf-8')
  }
}

async function readApplications() {
  await ensureDataFile()
  const raw = await readFile(applicationsFile, 'utf-8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeApplications(applications) {
  await ensureDataFile()
  await writeFile(applicationsFile, JSON.stringify(applications, null, 2), 'utf-8')
}
