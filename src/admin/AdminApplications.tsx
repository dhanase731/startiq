import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { downloadCsv, todayIsoDate } from './adminData'

export default function AdminApplications() {
  const [activeTab, setActiveTab] = useState<'all' | 'founder' | 'investor' | 'agency'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const applications = [
    { id: 'app_001', name: 'Priya Sharma', email: 'priya@techflow.ai', role: 'founder', company: 'TechFlow AI', sector: 'AI/ML', stage: 'Pre-Seed', amount: '₹1.5 Cr', date: '2024-03-12', status: 'pending', score: 74, initials: 'PS', color: '#21bfe8' },
    { id: 'app_002', name: 'Rahul Verma', email: 'rahul@vermacap.com', role: 'investor', company: 'Verma Capital', sector: 'Fintech', stage: 'Series A', amount: '₹5–20 Cr', date: '2024-03-11', status: 'approved', score: null, initials: 'RV', color: '#10b981' },
    { id: 'app_003', name: 'Neha Patel', email: 'neha@greencart.in', role: 'founder', company: 'GreenCart', sector: 'E-Commerce', stage: 'Seed', amount: '₹75L', date: '2024-03-10', status: 'reviewing', score: 61, initials: 'NP', color: '#8b5cf6' },
    { id: 'app_004', name: 'Amit Singh', email: 'amit@growthlabs.io', role: 'agency', company: 'Growth Labs', sector: 'Consulting', stage: 'N/A', amount: 'N/A', date: '2024-03-09', status: 'approved', score: null, initials: 'AS', color: '#f59e0b' },
    { id: 'app_005', name: 'Kavya Reddy', email: 'kavya@edutech.pro', role: 'founder', company: 'EduTech Pro', sector: 'EdTech', stage: 'Pre-Seed', amount: '₹50L', date: '2024-03-08', status: 'pending', score: 55, initials: 'KR', color: '#f43f5e' },
    { id: 'app_006', name: 'Sanjay Kumar', email: 'sanjay@angeli.in', role: 'investor', company: 'Angel Invest India', sector: 'D2C', stage: 'Pre-Seed', amount: '₹25L–1Cr', date: '2024-03-07', status: 'approved', score: null, initials: 'SK', color: '#6366f1' },
    { id: 'app_007', name: 'Anjali Desai', email: 'anjali@fintech.io', role: 'founder', company: 'FinTech Solutions', sector: 'Fintech', stage: 'Seed', amount: '₹2 Cr', date: '2024-03-06', status: 'reviewing', score: 81, initials: 'AD', color: '#21bfe8' },
    { id: 'app_008', name: 'Vikram Malhotra', email: 'vikram@vmax.com', role: 'investor', company: 'VentureMax', sector: 'SaaS', stage: 'Series B', amount: '₹20–50 Cr', date: '2024-03-05', status: 'rejected', score: null, initials: 'VM', color: '#6b7a8d' },
    { id: 'app_009', name: 'Ritu Agarwal', email: 'ritu@mediconn.in', role: 'founder', company: 'MediConnect', sector: 'HealthTech', stage: 'Pre-Seed', amount: '₹1 Cr', date: '2024-03-04', status: 'pending', score: 49, initials: 'RA', color: '#8b5cf6' },
    { id: 'app_010', name: 'Deepak Nair', email: 'deepak@cpro.co', role: 'agency', company: 'ConsultPro', sector: 'Grant Consulting', stage: 'N/A', amount: 'N/A', date: '2024-03-03', status: 'approved', score: null, initials: 'DN', color: '#f59e0b' },
  ]

  const filtered = applications.filter((app) => {
    const matchesTab = activeTab === 'all' || app.role === activeTab
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesStatus && matchesSearch
  })

  const counts = {
    all: applications.length,
    founder: applications.filter(a => a.role === 'founder').length,
    investor: applications.filter(a => a.role === 'investor').length,
    agency: applications.filter(a => a.role === 'agency').length,
  }

  const statusCounts = {
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const handleExportCsv = () => {
    const rows: Array<Array<string | number>> = [
      ['ID', 'Name', 'Email', 'Role', 'Company', 'Sector', 'Amount', 'Date', 'Score', 'Status'],
      ...filtered.map((app) => [
        app.id,
        app.name,
        app.email,
        app.role,
        app.company,
        app.sector,
        app.amount,
        app.date,
        app.score ?? '',
        app.status,
      ]),
    ]

    downloadCsv(`startiqo-applications-${todayIsoDate()}.csv`, rows)
  }

  return (
    <AdminLayout activePage="applications">
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1>Applications</h1>
            <p>Review and manage all incoming applications.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="admin-btn admin-btn-secondary" onClick={handleExportCsv}>
              ⬇ Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
          <div key={status} className={`admin-stat-card`} style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(status as 'pending' | 'reviewing' | 'approved' | 'rejected')}>
            <div className="admin-stat-header">
              <span className="admin-stat-label">{status}</span>
              <span className={`admin-badge ${
                status === 'approved' ? 'green' :
                status === 'reviewing' ? 'blue' :
                status === 'rejected' ? 'rose' :
                'amber'
              }`}>{status}</span>
            </div>
            <div className="admin-stat-value">{count}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
            {(['all', 'founder', 'investor', 'agency'] as const).map((tab) => (
              <button
                key={tab}
                className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{ fontSize: '0.7rem', marginLeft: '0.3rem', opacity: 0.7 }}>({counts[tab]})</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="admin-search">
              <span className="admin-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              style={{ padding: '0.48rem 0.75rem', borderRadius: '7px', border: '1px solid #d1d9e4', fontSize: '0.8rem', color: '#374151', outline: 'none', fontFamily: 'inherit' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'reviewing' | 'approved' | 'rejected')}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="admin-card-body no-pad">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Sector</th>
                  <th>Amount</th>
                  <th>Date</th>
                  {activeTab !== 'investor' && activeTab !== 'agency' && (
                    <th>Score</th>
                  )}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar-sm" style={{ background: app.color }}>
                          {app.initials}
                        </div>
                        <div>
                          <div className="cell-name">{app.name}</div>
                          <div className="cell-email">{app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        app.role === 'founder' ? 'purple' :
                        app.role === 'investor' ? 'green' : 'amber'
                      }`}>
                        {app.role}
                      </span>
                    </td>
                    <td className="cell-name">{app.company}</td>
                    <td className="cell-muted">{app.sector}</td>
                    <td className="cell-muted">{app.amount}</td>
                    <td className="cell-muted">{app.date}</td>
                    {activeTab !== 'investor' && activeTab !== 'agency' && (
                      <td>
                        {app.score !== null && app.score !== undefined ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="admin-progress" style={{ width: 60 }}>
                              <div
                                className="admin-progress-fill"
                                style={{
                                  width: `${app.score}%`,
                                  background: app.score >= 75 ? '#10b981' : app.score >= 50 ? '#f59e0b' : '#f43f5e'
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>{app.score}</span>
                          </div>
                        ) : (
                          <span className="cell-muted">—</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className={`admin-badge ${
                        app.status === 'approved' ? 'green' :
                        app.status === 'reviewing' ? 'blue' :
                        app.status === 'rejected' ? 'rose' :
                        'amber'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm">Review</button>
                        {app.status === 'pending' && (
                          <button className="admin-btn admin-btn-sm" style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-pagination">
          <span>Showing {filtered.length} of {applications.length} applications</span>
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
