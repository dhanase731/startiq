import type { FormEvent } from 'react'
import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { buildInitials, getTeamMembers, pickColor, saveTeamMembers, type TeamMemberRecord, type TeamRole } from './adminData'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'team'>('general')

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [newApplicationAlert, setNewApplicationAlert] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [systemAlerts, setSystemAlerts] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)

  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>(() => getTeamMembers())
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const handleInviteMember = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const role = String(formData.get('role') ?? 'Reviewer') as TeamRole

    if (!name || !email) {
      window.alert('Please fill name and email.')
      return
    }

    if (teamMembers.some((member) => member.email.toLowerCase() === email)) {
      window.alert('Team member already exists with this email.')
      return
    }

    const member: TeamMemberRecord = {
      name,
      email,
      role,
      initials: buildInitials(name),
      color: pickColor(email),
      lastActive: 'Just invited',
    }

    const nextMembers = [member, ...teamMembers]
    setTeamMembers(nextMembers)
    saveTeamMembers(nextMembers)
    setIsInviteOpen(false)
    event.currentTarget.reset()
  }

  const removeMember = (email: string) => {
    const nextMembers = teamMembers.filter((member) => member.email !== email)
    setTeamMembers(nextMembers)
    saveTeamMembers(nextMembers)
  }

  return (
    <AdminLayout activePage="settings">
      <div className="admin-page-header">
        <h1>Settings</h1>
        <p>Manage platform configuration and preferences.</p>
      </div>

      <div className="admin-tabs">
        {(['general', 'notifications', 'security', 'team'] as const).map((tab) => (
          <button key={tab} className={`admin-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>General Settings</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Platform Name</label>
                <div className="admin-form-hint">The name displayed across the platform.</div>
                <input className="admin-form-input" defaultValue="Startiqo" type="text" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Support Email</label>
                <div className="admin-form-hint">Visible to users for support inquiries.</div>
                <input className="admin-form-input" defaultValue="support@startiqo.com" type="email" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Platform Description</label>
              <div className="admin-form-hint">A short description used in emails and meta information.</div>
              <textarea
                className="admin-form-input admin-form-textarea"
                defaultValue="Startiqo is a verification-first funding ecosystem connecting founders with qualified investors through structured screening and curated introductions."
              />
            </div>
            <hr className="admin-form-divider" />
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Max Application Size (MB)</label>
                <input className="admin-form-input" defaultValue="5" type="number" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Review SLA (days)</label>
                <div className="admin-form-hint">Target days to review each application.</div>
                <input className="admin-form-input" defaultValue="7" type="number" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="admin-btn admin-btn-primary" onClick={() => window.alert('General settings saved.')}>Save Changes</button>
              <button className="admin-btn admin-btn-secondary" onClick={() => window.location.reload()}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Notification Preferences</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="admin-form-label" style={{ marginBottom: 0 }}>Email Notifications</div>
                  <div className="admin-form-hint" style={{ margin: 0 }}>Receive all platform notifications via email.</div>
                </div>
                <div className="admin-toggle" onClick={() => setEmailNotifs((v) => !v)}>
                  <div className={`admin-toggle-track ${emailNotifs ? 'on' : ''}`}>
                    <div className="admin-toggle-thumb" />
                  </div>
                  <span className="admin-toggle-text">{emailNotifs ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <hr className="admin-form-divider" style={{ margin: 0 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="admin-form-label" style={{ marginBottom: 0 }}>New Application Alerts</div>
                  <div className="admin-form-hint" style={{ margin: 0 }}>Notify immediately when a new application is submitted.</div>
                </div>
                <div className="admin-toggle" onClick={() => setNewApplicationAlert((v) => !v)}>
                  <div className={`admin-toggle-track ${newApplicationAlert ? 'on' : ''}`}>
                    <div className="admin-toggle-thumb" />
                  </div>
                  <span className="admin-toggle-text">{newApplicationAlert ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <hr className="admin-form-divider" style={{ margin: 0 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="admin-form-label" style={{ marginBottom: 0 }}>Weekly Digest</div>
                  <div className="admin-form-hint" style={{ margin: 0 }}>A summary email every Monday morning.</div>
                </div>
                <div className="admin-toggle" onClick={() => setWeeklyDigest((v) => !v)}>
                  <div className={`admin-toggle-track ${weeklyDigest ? 'on' : ''}`}>
                    <div className="admin-toggle-thumb" />
                  </div>
                  <span className="admin-toggle-text">{weeklyDigest ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <hr className="admin-form-divider" style={{ margin: 0 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="admin-form-label" style={{ marginBottom: 0 }}>System Alerts</div>
                  <div className="admin-form-hint" style={{ margin: 0 }}>Critical system and infrastructure alerts.</div>
                </div>
                <div className="admin-toggle" onClick={() => setSystemAlerts((v) => !v)}>
                  <div className={`admin-toggle-track ${systemAlerts ? 'on' : ''}`}>
                    <div className="admin-toggle-thumb" />
                  </div>
                  <span className="admin-toggle-text">{systemAlerts ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="admin-btn admin-btn-primary" onClick={() => window.alert('Notification preferences saved.')}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Security Settings</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div className="admin-form-label" style={{ marginBottom: 0 }}>Two-Factor Authentication</div>
                <div className="admin-form-hint" style={{ margin: 0 }}>Add an extra layer of security to admin accounts.</div>
              </div>
              <div className="admin-toggle" onClick={() => setTwoFactor((v) => !v)}>
                <div className={`admin-toggle-track ${twoFactor ? 'on' : ''}`}>
                  <div className="admin-toggle-thumb" />
                </div>
                <span className="admin-toggle-text">{twoFactor ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <hr className="admin-form-divider" />
            <div className="admin-form-group">
              <label className="admin-form-label">Change Password</label>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Current Password</label>
                <input className="admin-form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">New Password</label>
                <input className="admin-form-input" type="password" placeholder="Min 8 characters" />
              </div>
            </div>
            <hr className="admin-form-divider" />
            <div className="admin-form-group">
              <label className="admin-form-label">JWT Token Expiry</label>
              <div className="admin-form-hint">How long authentication tokens stay valid.</div>
              <select className="admin-form-input" defaultValue="7d" style={{ cursor: 'pointer' }}>
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="admin-btn admin-btn-primary" onClick={() => window.alert('Security settings updated.')}>Update Security</button>
              <button className="admin-btn admin-btn-secondary" style={{ color: '#e11d48', borderColor: '#fca5a5' }} onClick={() => window.alert('All sessions revoked (demo).')}>
                Revoke All Sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Team Members</h2>
            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setIsInviteOpen((prev) => !prev)}>
              {isInviteOpen ? 'Close' : '+ Invite Member'}
            </button>
          </div>

          {isInviteOpen ? (
            <div className="admin-card-body" style={{ borderBottom: '1px solid #eef1f6' }}>
              <form onSubmit={handleInviteMember} className="admin-inline-grid">
                <input className="admin-form-input" type="text" name="name" required placeholder="Member name" />
                <input className="admin-form-input" type="email" name="email" required placeholder="Member email" />
                <select className="admin-form-input" name="role" defaultValue="Reviewer">
                  <option value="Reviewer">Reviewer</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
                <button className="admin-btn admin-btn-primary" type="submit">
                  Send Invite
                </button>
              </form>
            </div>
          ) : null}

          <div className="admin-card-body no-pad">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.email}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar-sm" style={{ background: member.color }}>
                          {member.initials}
                        </div>
                        <span className="cell-name">{member.name}</span>
                      </div>
                    </td>
                    <td className="cell-email">{member.email}</td>
                    <td>
                      <span className={`admin-badge ${member.role === 'Super Admin' ? 'rose' : member.role === 'Moderator' ? 'blue' : 'gray'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="cell-muted">{member.lastActive}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm">Edit</button>
                        {member.role !== 'Super Admin' ? (
                          <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ color: '#e11d48' }} onClick={() => removeMember(member.email)}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
