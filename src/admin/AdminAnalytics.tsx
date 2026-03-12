import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { downloadCsv, todayIsoDate } from './adminData'

export default function AdminAnalytics() {
  const [range, setRange] = useState<'year' | 'quarter'>('year')

  const monthlyData = [
    { month: 'Sep', founders: 12, investors: 5, agencies: 2 },
    { month: 'Oct', founders: 18, investors: 8, agencies: 3 },
    { month: 'Nov', founders: 22, investors: 10, agencies: 5 },
    { month: 'Dec', founders: 15, investors: 7, agencies: 2 },
    { month: 'Jan', founders: 29, investors: 14, agencies: 6 },
    { month: 'Feb', founders: 35, investors: 18, agencies: 8 },
    { month: 'Mar', founders: 42, investors: 21, agencies: 11 },
  ]

  const quarterlyData = [
    { month: 'Q1', founders: 30, investors: 15, agencies: 6 },
    { month: 'Q2', founders: 36, investors: 18, agencies: 8 },
    { month: 'Q3', founders: 44, investors: 20, agencies: 9 },
    { month: 'Q4', founders: 52, investors: 24, agencies: 12 },
  ]

  const topSectors = [
    { name: 'AI / Machine Learning', count: 48, pct: 86 },
    { name: 'FinTech', count: 35, pct: 63 },
    { name: 'HealthTech', count: 28, pct: 50 },
    { name: 'EdTech', count: 22, pct: 39 },
    { name: 'E-Commerce / D2C', count: 19, pct: 34 },
    { name: 'SaaS / B2B', count: 17, pct: 30 },
    { name: 'CleanTech', count: 11, pct: 20 },
  ]

  const conversionData = [
    { stage: 'Applied', count: 342, pct: 100, color: '#21bfe8' },
    { stage: 'Verified', count: 289, pct: 84, color: '#6366f1' },
    { stage: 'Matched', count: 196, pct: 57, color: '#10b981' },
    { stage: 'Introduced', count: 112, pct: 33, color: '#f59e0b' },
    { stage: 'Deal Closed', count: 38, pct: 11, color: '#f43f5e' },
  ]

  const geographyData = [
    { city: 'Bangalore', pct: 32, color: '#21bfe8' },
    { city: 'Mumbai', pct: 24, color: '#6366f1' },
    { city: 'Delhi NCR', pct: 20, color: '#10b981' },
    { city: 'Hyderabad', pct: 11, color: '#f59e0b' },
    { city: 'Chennai', pct: 8, color: '#f43f5e' },
    { city: 'Others', pct: 5, color: '#9ca3af' },
  ]

  const chartData = range === 'year' ? monthlyData : quarterlyData
  const maxMonthly = Math.max(...chartData.map((d) => d.founders + d.investors + d.agencies))

  const handleExport = () => {
    const rows: Array<Array<string | number>> = [
      ['Period', 'Founders', 'Investors', 'Agencies', 'Total'],
      ...chartData.map((entry) => [
        entry.month,
        entry.founders,
        entry.investors,
        entry.agencies,
        entry.founders + entry.investors + entry.agencies,
      ]),
    ]

    downloadCsv(`startiqo-analytics-${range}-${todayIsoDate()}.csv`, rows)
  }

  return (
    <AdminLayout activePage="analytics">
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1>Analytics</h1>
            <p>Platform performance metrics and insights. Viewing: {range === 'year' ? 'This Year' : 'This Quarter'}.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => setRange((prev) => (prev === 'year' ? 'quarter' : 'year'))}
            >
              {range === 'year' ? 'This Year' : 'This Quarter'}
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleExport}>
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.25rem' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Applications</span>
            <div className="admin-stat-icon blue">📄</div>
          </div>
          <div className="admin-stat-value">342</div>
          <div className="admin-stat-change up">↑ +23% <span className="admin-stat-period">vs last quarter</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Match Rate</span>
            <div className="admin-stat-icon green">🎯</div>
          </div>
          <div className="admin-stat-value">57%</div>
          <div className="admin-stat-change up">↑ +4% <span className="admin-stat-period">vs last quarter</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Avg. Readiness Score</span>
            <div className="admin-stat-icon purple">⭐</div>
          </div>
          <div className="admin-stat-value">64.2</div>
          <div className="admin-stat-change up">↑ +2.1 <span className="admin-stat-period">vs last month</span></div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Deals Closed</span>
            <div className="admin-stat-icon amber">🤝</div>
          </div>
          <div className="admin-stat-value">38</div>
          <div className="admin-stat-change up">↑ +8 <span className="admin-stat-period">this month</span></div>
        </div>
      </div>

      <div className="admin-grid-2" style={{ marginBottom: '1.25rem' }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Monthly Application Volume</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-chart">
              {chartData.map((d, i) => {
                const total = d.founders + d.investors + d.agencies
                return (
                  <div
                    key={i}
                    className="admin-chart-bar"
                    style={{
                      height: `${(total / maxMonthly) * 85}%`,
                      background: 'linear-gradient(180deg, #21bfe8 0%, #1a8fd4 100%)',
                    }}
                  >
                    <span className="bar-value">{total}</span>
                    <span className="bar-label">{d.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="admin-legend" style={{ marginTop: '2rem' }}>
              <div className="admin-legend-item">
                <div className="admin-legend-dot" style={{ background: '#21bfe8' }} />
                Founders
              </div>
              <div className="admin-legend-item">
                <div className="admin-legend-dot" style={{ background: '#10b981' }} />
                Investors
              </div>
              <div className="admin-legend-item">
                <div className="admin-legend-dot" style={{ background: '#f59e0b' }} />
                Agencies
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Conversion Funnel</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {conversionData.map((stage) => (
                <div key={stage.stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{stage.stage}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>
                      {stage.count} <span style={{ color: '#9ca3af', fontWeight: 500 }}>({stage.pct}%)</span>
                    </span>
                  </div>
                  <div className="admin-progress">
                    <div
                      className="admin-progress-fill"
                      style={{ width: `${stage.pct}%`, background: stage.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Sectors</h2>
          </div>
          <div className="admin-card-body no-pad">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sector</th>
                  <th>Applications</th>
                  <th>Share</th>
                </tr>
              </thead>
              <tbody>
                {topSectors.map((sector, index) => (
                  <tr key={sector.name}>
                    <td className="cell-muted">{index + 1}</td>
                    <td className="cell-name">{sector.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="admin-progress" style={{ width: 80 }}>
                          <div
                            className="admin-progress-fill"
                            style={{ width: `${sector.pct}%`, background: '#21bfe8' }}
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{sector.count}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge blue">{sector.pct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Applications by Geography</h2>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div
                className="admin-donut"
                style={{
                  background: `conic-gradient(
                    #21bfe8 0% 32%,
                    #6366f1 32% 56%,
                    #10b981 56% 76%,
                    #f59e0b 76% 87%,
                    #f43f5e 87% 95%,
                    #9ca3af 95% 100%
                  )`
                }}
              >
                <div className="admin-donut-center">
                  <div className="admin-donut-value">342</div>
                  <div className="admin-donut-label">total</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {geographyData.map((geo) => (
                  <div key={geo.city} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: geo.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.82rem', color: '#374151', minWidth: 90 }}>{geo.city}</span>
                    <div className="admin-progress" style={{ width: 80 }}>
                      <div className="admin-progress-fill" style={{ width: `${geo.pct * 3}%`, background: geo.color }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6b7a8d' }}>{geo.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
