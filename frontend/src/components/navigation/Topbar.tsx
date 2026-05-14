import { Bell, LogOut, Search, UserCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 sm:flex items-center gap-2 text-slate-600">
            <Search className="h-4 w-4" />
            <input
              type="search"
              placeholder="Search requests, users, activity"
              className="w-72 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2">
            <UserCircle2 className="h-6 w-6 text-slate-600" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.full_name ?? 'Loading...'}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
