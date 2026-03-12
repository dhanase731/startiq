import { type ReactNode } from 'react'
import logoMark from '../assets/startiqo-logo.svg'
import '../admin/admin.css'

interface AdminLayoutProps {
  children: ReactNode
  activePage?: string
}

export default function AdminLayout({ children, activePage = 'dashboard' }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <AdminSidebar activePage={activePage} />
      <main className="admin-main">{children}</main>
    </div>
  )
}

function AdminSidebar({ activePage }: { activePage: string }) {
  const storedUser = localStorage.getItem('startiq_user')
  const parsedUser = (() => {
    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser) as { fullName?: string }
    } catch {
      return null
    }
  })()
  const displayName = parsedUser?.fullName || 'Admin User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'AD'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
    { id: 'applications', label: 'Applications', icon: '📄', href: '/admin/applications', count: 24 },
    { id: 'users', label: 'Users', icon: '👥', href: '/admin/users', count: 142 },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/admin/settings' },
  ]

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img src={logoMark} alt="Startiqo logo" />
        <span>Startiqo</span>
        <span className="brand-badge">Admin</span>
      </div>

      <nav className="admin-nav">
        <div className="admin-nav-section">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`admin-nav-item ${activePage === item.id ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== undefined && <span className="nav-count">{item.count}</span>}
            </a>
          ))}
        </div>

        <a href="/" className="admin-back-link">
          ← Back to Site
        </a>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-avatar">{initials}</div>
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-name">{displayName}</div>
          <div className="admin-sidebar-user-role">Administrator</div>
        </div>
      </div>
    </aside>
  )
}
