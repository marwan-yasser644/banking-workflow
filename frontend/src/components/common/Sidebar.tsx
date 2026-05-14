import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils'
import { 
  LayoutDashboard, 
  FileText, 
  ArrowRightLeft, 
  Users, 
  Bell, 
  BarChart3, 
  LogBook,
  Settings,
  Menu,
  X,
  Home,
  ChevronDown
} from 'lucide-react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Loan Requests', href: '/requests' },
    { icon: ArrowRightLeft, label: 'Workflow Tracking', href: '/workflow' },
    { icon: Users, label: 'Users Management', href: '/users' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: LogBook, label: 'Audit Logs', href: '/audit' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-primary text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-bank-navy text-white transition-transform duration-300 z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Home size={20} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">BankFlow</h1>
            <p className="text-xs text-blue-200">Workflow System</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User info section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-blue-200 truncate">Approver</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
