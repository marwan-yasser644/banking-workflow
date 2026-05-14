import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-800/70 bg-slate-900/95 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold">BankFlow Enterprise</h1>
          <p className="mt-3 text-slate-400">Secure banking workflow management for lending teams.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
