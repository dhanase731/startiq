import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  type AdminUserRecord,
  type AdminUserRole,
  buildInitials,
  downloadCsv,
  getAdminUsers,
  pickColor,
  saveAdminUsers,
  todayIsoDate,
} from './adminData'

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'founder' | 'investor' | 'agency'>('all')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [users, setUsers] = useState<AdminUserRecord[]>(() => getAdminUsers())

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.company.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
      }),
    [roleFilter, searchTerm, users],
  )

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: '👥', color: 'blue' },
    { label: 'Founders', value: users.filter((u) => u.role === 'founder').length.toString(), icon: '🚀', color: 'purple' },
    { label: 'Investors', value: users.filter((u) => u.role === 'investor').length.toString(), icon: '💼', color: 'green' },
    { label: 'Agencies', value: users.filter((u) => u.role === 'agency').length.toString(), icon: '🏢', color: 'amber' },
  ]

  const handleAddUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const role = String(formData.get('role') ?? 'founder') as AdminUserRole
    const company = String(formData.get('company') ?? '').trim()

    if (!name || !email || !company) {
      window.alert('Please fill all required fields.')
      return
    }

    if (users.some((user) => user.email.toLowerCase() === email)) {
      window.alert('A user with this email already exists.')
      return
    }

    const newUser: AdminUserRecord = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      company,
      joined: todayIsoDate(),
      status: 'active',
      initials: buildInitials(name),
      color: pickColor(email),
    }

    const nextUsers = [newUser, ...users]
    setUsers(nextUsers)
    saveAdminUsers(nextUsers)
    setIsAddUserOpen(false)
    event.currentTarget.reset()
  }

  const handleExportUsers = () => {
    const rows: Array<Array<string | number>> = [
      ['ID', 'Name', 'Email', 'Role', 'Company', 'Joined', 'Status'],
      ...filteredUsers.map((user) => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.company,
        user.joined,
        user.status,
      ]),
    ]

    downloadCsv(`startiqo-users-${todayIsoDate()}.csv`, rows)
  }

  return (
    <AdminLayout activePage="users">
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1>Users</h1>
            <p>Manage all registered users across the platform.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="admin-btn admin-btn-secondary" onClick={handleExportUsers}>
              ⬇ Export
            </button>
            <button className="admin-btn admin-btn-primary" onClick={() => setIsAddUserOpen((prev) => !prev)}>
              {isAddUserOpen ? 'Close' : '+ Add User'}
            </button>
          </div>
        </div>
      </div>

      {isAddUserOpen ? (
        <div className="admin-card" style={{ marginBottom: '1rem' }}>
          <div className="admin-card-header">
            <h2>Add New User</h2>
          </div>
          <div className="admin-card-body">
            <form onSubmit={handleAddUser} className="admin-inline-grid">
              <input className="admin-form-input" type="text" name="name" required placeholder="Full name" />
              <input className="admin-form-input" type="email" name="email" required placeholder="Email" />
              <input className="admin-form-input" type="text" name="company" required placeholder="Company" />
              <select className="admin-form-input" name="role" defaultValue="founder">
                <option value="founder">Founder</option>
                <option value="investor">Investor</option>
                <option value="agency">Agency</option>
              </select>
              <button className="admin-btn admin-btn-primary" type="submit">
                Save User
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-label">{stat.label}</span>
              <div className={`admin-stat-icon ${stat.color}`}>{stat.icon}</div>
            </div>
            <div className="admin-stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>All Users</h2>
          <div className="admin-toolbar">
            <div className="admin-search">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="admin-filter-group">
              <button className={`admin-filter-btn ${roleFilter === 'all' ? 'active' : ''}`} onClick={() => setRoleFilter('all')}>
                All
              </button>
              <button className={`admin-filter-btn ${roleFilter === 'founder' ? 'active' : ''}`} onClick={() => setRoleFilter('founder')}>
                Founders
              </button>
              <button className={`admin-filter-btn ${roleFilter === 'investor' ? 'active' : ''}`} onClick={() => setRoleFilter('investor')}>
                Investors
              </button>
              <button className={`admin-filter-btn ${roleFilter === 'agency' ? 'active' : ''}`} onClick={() => setRoleFilter('agency')}>
                Agencies
              </button>
            </div>
          </div>
        </div>
        <div className="admin-card-body no-pad">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar-sm" style={{ background: user.color }}>
                          {user.initials}
                        </div>
                        <span className="cell-name">{user.name}</span>
                      </div>
                    </td>
                    <td className="cell-email">{user.email}</td>
                    <td>
                      <span className={`admin-badge ${user.role === 'founder' ? 'purple' : user.role === 'investor' ? 'green' : 'amber'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="cell-muted">{user.company}</td>
                    <td className="cell-muted">{user.joined}</td>
                    <td>
                      <span className={`admin-badge ${user.status === 'active' ? 'green' : user.status === 'pending' ? 'amber' : 'gray'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-pagination">
          <span>
            Showing {filteredUsers.length} of {users.length} users
          </span>
          <div className="admin-pagination-pages">
            <button className="admin-page-btn active">1</button>
            <button className="admin-page-btn">2</button>
            <button className="admin-page-btn">3</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
