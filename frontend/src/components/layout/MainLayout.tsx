import { Outlet } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:pl-72">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
