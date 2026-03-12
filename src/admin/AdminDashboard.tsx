import AdminLayout from './AdminLayout'
import { downloadJson, getAdminUsers } from './adminData'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Applications', value: '342', change: '+12%', period: 'vs last week', icon: '📄', color: 'blue', up: true },
    { label: 'Active Users', value: '142', change: '+8%', period: 'vs last month', icon: '👥', color: 'green', up: true },
    { label: 'Pending Reviews', value: '24', change: '-3%', period: 'vs yesterday', icon: '⏳', color: 'amber', up: false },
    { label: 'Total Revenue', value: '₹8.4L', change: '+15%', period: 'vs last month', icon: '💰', color: 'purple', up: true },
  ]

  const recentApplications = [
    { id: 'app_001', name: 'Priya Sharma', role: 'Founder', company: 'TechFlow AI', date: '2h ago', status: 'pending' },
    { id: 'app_002', name: 'Rahul Verma', role: 'Investor', company: 'Verma Capital', date: '4h ago', status: 'approved' },
    { id: 'app_003', name: 'Neha Patel', role: 'Founder', company: 'GreenCart', date: '6h ago', status: 'reviewing' },
    { id: 'app_004', name: 'Amit Singh', role: 'Agency', company: 'Growth Labs', date: '8h ago', status: 'approved' },
    { id: 'app_005', name: 'Kavya Reddy', role: 'Founder', company: 'EduTech Pro', date: '12h ago', status: 'pending' },
  ]

  const recentActivity = [
    { text: 'Priya Sharma submitted a Founder application', time: '2h ago', color: '#21bfe8' },
    { text: 'Rahul Verma was approved as Investor', time: '4h ago', color: '#10b981' },
    { text: 'Admin updated system settings', time: '5h ago', color: '#8b5cf6' },
    { text: 'Neha Patel application moved to review', time: '6h ago', color: '#f59e0b' },
    { text: 'Amit Singh was approved as Agency partner', time: '8h ago', color: '#10b981' },
    { text: 'System backup completed successfully', time: '10h ago', color: '#6366f1' },
  ]

  const handleDownloadReport = () => {
    const reportPayload = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalApplications: stats.find((item) => item.label === 'Total Applications')?.value,
        activeUsers: getAdminUsers().length,
        pendingReviews: stats.find((item) => item.label === 'Pending Reviews')?.value,
        totalRevenue: stats.find((item) => item.label === 'Total Revenue')?.value,
      },
      recentApplications,
      recentActivity,
    }

    downloadJson(`startiqo-admin-report-${new Date().toISOString().slice(0, 10)}.json`, reportPayload)
  }

  return (
    <AdminLayout activePage="dashboard">
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's what's happening with your platform.</p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={handleDownloadReport}>
            📊 Download Report
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`admin-stat-card`}>
            <div className="admin-stat-header">
              <span className="admin-stat-label">{stat.label}</span>
              <div className={`admin-stat-icon ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="admin-stat-value">{stat.value}</div>
            <div className={`admin-stat-change ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? '↑' : '↓'} {stat.change}
              <span className="admin-stat-period">{stat.period}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Applications</h2>
            <a href="/admin/applications" className="admin-btn admin-btn-ghost admin-btn-sm">
              View all →
            </a>
          </div>
          <div className="admin-card-body no-pad">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td className="cell-name">{app.name}</td>
                      <td>{app.role}</td>
                      <td className="cell-muted">{app.company}</td>
                      <td className="cell-muted">{app.date}</td>
                      <td>
                        <span className={`admin-badge ${
                          app.status === 'approved' ? 'green' : 
                          app.status === 'reviewing' ? 'blue' : 
                          'amber'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="admin-card-body">
            <ul className="admin-activity-list">
              {recentActivity.map((activity, index) => (
                <li key={index} className="admin-activity-item">
                  <div className="admin-activity-dot" style={{ background: activity.color }} />
                  <div className="admin-activity-text">{activity.text}</div>
                  <div className="admin-activity-time">{activity.time}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Application Trends (Last 7 Days)</h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-chart">
            {[45, 52, 38, 65, 58, 72, 68].map((height, i) => (
              <div
                key={i}
                className="admin-chart-bar"
                style={{
                  height: `${height}%`,
                  background: `linear-gradient(180deg, #21bfe8 0%, #1a8fd4 100%)`,
                }}
              >
                <span className="bar-value">{Math.round(height * 0.85)}</span>
                <span className="bar-label">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
