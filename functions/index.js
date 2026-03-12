import cors from 'cors'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { onRequest } from 'firebase-functions/v2/https'
import pool, { initDb } from './db.js'

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_strong_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const requiredFieldsByRole = {
  founder: ['fullName', 'email', 'phone', 'companyName', 'linkedin', 'sector', 'fundingStage', 'amountSeeking', 'pitch'],
  investor: ['fullName', 'email', 'phone', 'linkedin', 'investorType', 'sectors', 'ticketSize', 'stagePreference', 'whyStartiqo'],
  agency: ['contactName', 'email', 'phone', 'firmName', 'linkedin', 'serviceType', 'regions', 'yearsExperience', 'services'],
}

let initPromise
async function ensureDbReady() {
  if (!initPromise) {
    initPromise = initDb().catch((error) => {
      initPromise = undefined
      throw error
    })
  }

  return initPromise
}

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.use(async (_req, _res, next) => {
  try {
    await ensureDbReady()
    next()
  } catch (error) {
    next(error)
  }
})

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
    return res.status(400).json({ message: 'Missing required fields.', missingFields })
  }

  const payload = Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
  )

  const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const { rows } = await pool.query(
    `INSERT INTO applications (id, role, payload, status, submitted_at)
     VALUES ($1, $2, $3, 'received', NOW()) RETURNING id`,
    [id, role, JSON.stringify(payload)],
  )

  return res.status(201).json({
    message: `${role[0].toUpperCase()}${role.slice(1)} application submitted successfully.`,
    applicationId: rows[0].id,
  })
})

app.get('/api/applications', async (req, res) => {
  const role = typeof req.query.role === 'string' ? req.query.role.toLowerCase() : null
  const { rows } = role
    ? await pool.query('SELECT * FROM applications WHERE role = $1 ORDER BY submitted_at DESC', [role])
    : await pool.query('SELECT * FROM applications ORDER BY submitted_at DESC')

  return res.json({ total: rows.length, items: rows })
})

app.patch('/api/applications/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body ?? {}
  const allowed = ['received', 'reviewing', 'approved', 'rejected']

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` })
  }

  const { rows } = await pool.query(
    'UPDATE applications SET status = $1 WHERE id = $2 RETURNING id, status',
    [status, id],
  )

  if (rows.length === 0) return res.status(404).json({ message: 'Application not found.' })
  return res.json({ message: 'Status updated.', application: rows[0] })
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

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'Email is already registered.' })
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, 10)
  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const { rows } = await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, created_at)
     VALUES ($1, $2, $3, $4, 'user', NOW())
     RETURNING id, full_name, email, role`,
    [id, normalizedName, normalizedEmail, passwordHash],
  )

  const user = rows[0]
  return res.status(201).json({ message: 'Registration successful.', token: signToken(user), user: dbUserToClient(user) })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail])
  if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials.' })

  const user = rows[0]
  const isValid = await bcrypt.compare(String(password), user.password_hash)
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials.' })

  return res.json({ message: 'Login successful.', token: signToken(user), user: dbUserToClient(user) })
})

app.get('/api/auth/me', async (req, res) => {
  const token = getBearerToken(req)
  if (!token) return res.status(401).json({ message: 'Missing authorization token.' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (!payload || typeof payload !== 'object' || !payload.sub) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    const { rows } = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [payload.sub])
    if (rows.length === 0) return res.status(401).json({ message: 'User not found.' })

    return res.json({ user: dbUserToClient(rows[0]) })
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
})

app.get('/api/users', async (_req, res) => {
  const { rows } = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC')
  return res.json({ total: rows.length, items: rows.map(dbUserToClient) })
})

app.post('/api/users', async (req, res) => {
  const { fullName, email, password = 'Startiqo@123', role = 'user' } = req.body ?? {}
  if (!fullName || !email) return res.status(400).json({ message: 'fullName and email are required.' })

  const normalizedEmail = String(email).trim().toLowerCase()
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
  if (existing.rows.length > 0) return res.status(409).json({ message: 'Email is already registered.' })

  const passwordHash = await bcrypt.hash(String(password), 10)
  const id = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const { rows } = await pool.query(
    `INSERT INTO users (id, full_name, email, password_hash, role, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING id, full_name, email, role, created_at`,
    [id, String(fullName).trim(), normalizedEmail, passwordHash, role],
  )

  return res.status(201).json({ message: 'User created successfully.', user: dbUserToClient(rows[0]) })
})

app.delete('/api/users/:id', async (req, res) => {
  const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id])
  if (rows.length === 0) return res.status(404).json({ message: 'User not found.' })
  return res.json({ message: 'User deleted.' })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Internal server error.' })
})

export const api = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  app,
)

function getBearerToken(req) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return null
  return auth.slice('Bearer '.length).trim()
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function dbUserToClient(row) {
  return { id: row.id, fullName: row.full_name, email: row.email, role: row.role, createdAt: row.created_at }
}
