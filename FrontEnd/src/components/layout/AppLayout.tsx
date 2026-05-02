import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PlusCircle, Users,
  Bell, ClipboardList, LogOut, Menu, X,
  ChevronRight, Moon, Sun, Shield,
} from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services'

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  roles?: string[]
}

const NAV: NavItem[] = [
  { to: '/dashboard',     icon: <LayoutDashboard size={18} />, label: 'Dashboard',    roles: ['ADMIN','CHECKER','APPROVER'] },
  { to: '/loans',         icon: <FileText size={18} />,        label: 'Loan Requests' },
  { to: '/loans/create',  icon: <PlusCircle size={18} />,      label: 'New Loan',     roles: ['MAKER','ADMIN'] },
  { to: '/notifications', icon: <Bell size={18} />,            label: 'Notifications' },
  { to: '/audit',         icon: <ClipboardList size={18} />,   label: 'Audit Log',    roles: ['ADMIN','CHECKER','APPROVER'] },
  { to: '/users',         icon: <Users size={18} />,           label: 'Users',        roles: ['ADMIN'] },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const { data: notifs } = useQuery({
    queryKey: ['notifs-unread'],
    queryFn: () => notificationService.list(true),
    refetchInterval: 30_000,
  })
  const unreadCount = notifs?.length ?? 0

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDark(d => !d)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleNav = NAV.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={cn(
        'flex flex-col h-full bg-[var(--color-brand)] text-white transition-all duration-300 flex-shrink-0 z-30',
        collapsed ? 'w-16' : 'w-[260px]'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-[var(--color-brand)]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight truncate">BankFlow</p>
              <p className="text-xs text-white/50 truncate">Workflow System</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {visibleNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0 relative">
                {item.icon}
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[var(--color-accent)] text-[var(--color-brand)] rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && <ChevronRight size={14} className="ml-auto opacity-0 group-[.active]:opacity-60" />}
            </NavLink>
          ))}
        </nav>

        {/* Footer: user + actions */}
        <div className="border-t border-white/10 p-3 flex flex-col gap-1">
          {/* Dark toggle */}
          <button
            onClick={toggleDark}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm',
              collapsed && 'justify-center'
            )}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm',
              collapsed && 'justify-center'
            )}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {/* User pill */}
          {!collapsed && user && (
            <div className="mt-1 px-3 py-2.5 bg-white/5 rounded-lg">
              <p className="text-sm font-semibold truncate">{user.full_name}</p>
              <p className="text-xs text-[var(--color-accent)] font-medium">{user.role}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-3 px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex-shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-muted)] transition-colors"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
          <div className="flex-1" />
          {/* Role badge */}
          <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full text-[var(--color-muted)]">
            {user?.role}
          </span>
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.charAt(0) ?? '?'}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}