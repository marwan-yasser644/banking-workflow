import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="grid min-h-[calc(100vh-160px)] place-items-center text-center">
    <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-12 shadow-card">
      <p className="text-sm uppercase tracking-[0.4em] text-slate-500">404 error</p>
      <h1 className="mt-6 text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-4 text-slate-600">The route you are looking for does not exist or has been moved.</p>
      <Link to="/dashboard" className="mt-8 inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
        Back to dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
