import cors from 'cors'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const PORT = Number(process.env.PORT) || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const applicationsFile = path.join(dataDir, 'applications.json')
const usersFile = path.join(dataDir, 'users.json')
const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_strong_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

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

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password } = req.body ?? {}

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const normalizedName = String(fullName).trim()
  const normalizedPassword = String(password)

  if (normalizedPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' })
  }

  const users = await readUsers()
  const existingUser = users.find((user) => user.email === normalizedEmail)

  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered.' })
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, 10)

  const user = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    fullName: normalizedName,
    email: normalizedEmail,
    passwordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  await writeUsers(users)

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )

  return res.status(201).json({
    message: 'Registration successful.',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const normalizedPassword = String(password)
  const users = await readUsers()
  const user = users.find((item) => item.email === normalizedEmail)

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }

  const isValidPassword = await bcrypt.compare(normalizedPassword, user.passwordHash)

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials.' })
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )

  return res.json({
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  })

})

app.get('/api/auth/me', async (req, res) => {
  const token = getBearerToken(req)

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token.' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)

    if (!payload || typeof payload !== 'object' || !payload.sub) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    const users = await readUsers()
    const user = users.find((item) => item.id === payload.sub)

    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
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

  try {
    await readFile(usersFile, 'utf-8')
  } catch {
    await writeFile(usersFile, '[]', 'utf-8')
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

async function readUsers() {
  await ensureDataFile()
  const raw = await readFile(usersFile, 'utf-8')

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeUsers(users) {
  await ensureDataFile()
  await writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8')
}

function getBearerToken(req) {
  const authorizationHeader = req.headers.authorization

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null
  }

  return authorizationHeader.slice('Bearer '.length).trim()
}
