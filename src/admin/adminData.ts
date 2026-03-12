export type AdminUserRole = 'founder' | 'investor' | 'agency'
export type AdminUserStatus = 'active' | 'pending' | 'inactive'

export type AdminUserRecord = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  company: string
  joined: string
  status: AdminUserStatus
  initials: string
  color: string
}

export type TeamRole = 'Super Admin' | 'Moderator' | 'Reviewer'

export type TeamMemberRecord = {
  name: string
  email: string
  role: TeamRole
  initials: string
  color: string
  lastActive: string
}

const STORAGE_USERS_KEY = 'startiq_admin_users'
const STORAGE_TEAM_KEY = 'startiq_admin_team_members'

const USER_COLORS = ['#21bfe8', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e', '#6366f1']

const defaultUsers: AdminUserRecord[] = [
  { id: 'usr_001', name: 'Priya Sharma', email: 'priya@techflow.ai', role: 'founder', company: 'TechFlow AI', joined: '2024-01-15', status: 'active', initials: 'PS', color: '#21bfe8' },
  { id: 'usr_002', name: 'Rahul Verma', email: 'rahul@vermacap.com', role: 'investor', company: 'Verma Capital', joined: '2024-02-03', status: 'active', initials: 'RV', color: '#10b981' },
  { id: 'usr_003', name: 'Neha Patel', email: 'neha@greencart.in', role: 'founder', company: 'GreenCart', joined: '2024-02-12', status: 'inactive', initials: 'NP', color: '#8b5cf6' },
  { id: 'usr_004', name: 'Amit Singh', email: 'amit@growthlabs.io', role: 'agency', company: 'Growth Labs', joined: '2024-02-20', status: 'active', initials: 'AS', color: '#f59e0b' },
  { id: 'usr_005', name: 'Kavya Reddy', email: 'kavya@edutech.pro', role: 'founder', company: 'EduTech Pro', joined: '2024-03-01', status: 'active', initials: 'KR', color: '#f43f5e' },
  { id: 'usr_006', name: 'Sanjay Kumar', email: 'sanjay@angelinvest.in', role: 'investor', company: 'Angel Invest India', joined: '2024-03-05', status: 'active', initials: 'SK', color: '#6366f1' },
  { id: 'usr_007', name: 'Anjali Desai', email: 'anjali@fintech.io', role: 'founder', company: 'FinTech Solutions', joined: '2024-03-08', status: 'active', initials: 'AD', color: '#21bfe8' },
  { id: 'usr_008', name: 'Vikram Malhotra', email: 'vikram@venturemax.com', role: 'investor', company: 'VentureMax', joined: '2024-03-10', status: 'active', initials: 'VM', color: '#10b981' },
  { id: 'usr_009', name: 'Ritu Agarwal', email: 'ritu@mediconnect.in', role: 'founder', company: 'MediConnect', joined: '2024-03-11', status: 'pending', initials: 'RA', color: '#8b5cf6' },
  { id: 'usr_010', name: 'Deepak Nair', email: 'deepak@consultpro.co', role: 'agency', company: 'ConsultPro', joined: '2024-03-12', status: 'active', initials: 'DN', color: '#f59e0b' },
]

const defaultTeamMembers: TeamMemberRecord[] = [
  { name: 'Admin User', email: 'admin@startiqo.com', role: 'Super Admin', initials: 'AU', color: '#21bfe8', lastActive: 'Now' },
  { name: 'Rajan Mehta', email: 'rajan@startiqo.com', role: 'Moderator', initials: 'RM', color: '#10b981', lastActive: '2h ago' },
  { name: 'Sunita Rao', email: 'sunita@startiqo.com', role: 'Reviewer', initials: 'SR', color: '#8b5cf6', lastActive: '1d ago' },
]

export function getAdminUsers(): AdminUserRecord[] {
  const parsed = readJson<AdminUserRecord[]>(STORAGE_USERS_KEY)

  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    writeJson(STORAGE_USERS_KEY, defaultUsers)
    return defaultUsers
  }

  return parsed
}

export function saveAdminUsers(users: AdminUserRecord[]) {
  writeJson(STORAGE_USERS_KEY, users)
}

export function getTeamMembers(): TeamMemberRecord[] {
  const parsed = readJson<TeamMemberRecord[]>(STORAGE_TEAM_KEY)

  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    writeJson(STORAGE_TEAM_KEY, defaultTeamMembers)
    return defaultTeamMembers
  }

  return parsed
}

export function saveTeamMembers(members: TeamMemberRecord[]) {
  writeJson(STORAGE_TEAM_KEY, members)
}

export function buildInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return 'NA'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function pickColor(seedText: string): string {
  const total = seedText
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return USER_COLORS[total % USER_COLORS.length]
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function downloadCsv(fileName: string, rows: Array<Array<string | number>>) {
  const csvText = rows.map((row) => row.map(toCsvCell).join(',')).join('\n')
  downloadTextFile(fileName, csvText, 'text/csv;charset=utf-8;')
}

export function downloadJson(fileName: string, data: unknown) {
  const jsonText = JSON.stringify(data, null, 2)
  downloadTextFile(fileName, jsonText, 'application/json;charset=utf-8;')
}

function toCsvCell(value: string | number): string {
  const escaped = String(value).replaceAll('"', '""')
  return `"${escaped}"`
}

function downloadTextFile(fileName: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}

function readJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}
