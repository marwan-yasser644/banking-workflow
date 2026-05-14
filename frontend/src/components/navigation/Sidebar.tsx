import { NavLink } from 'react-router-dom';
import { CreditCard, ShieldCheck, ClipboardList, Users, Bell, BarChart3, FileText, Settings2, Home } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Loan Requests', href: '/requests', icon: CreditCard },
  { label: 'Workflow Tracker', href: '/workflow/1', icon: ClipboardList },
  { label: 'Users', href: '/users', icon: Users },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Audit Logs', href: '/audit', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings2 },
];

export const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl lg:static lg:w-72 lg:border-b-0 lg:border-r lg:border-slate-200/80">
      <div className="flex h-full flex-col px-6 py-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-card">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">BankFlow</p>
            <h2 className="text-xl font-semibold text-slate-900">Workflow Suite</h2>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white shadow-card' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 shadow-card">
          <p className="font-semibold text-slate-900">Approval workflow</p>
          <p className="mt-2 text-slate-500">Track risk, volume, and approval flow through a secure banking interface.</p>
        </div>
      </div>
    </aside>
  );
};
