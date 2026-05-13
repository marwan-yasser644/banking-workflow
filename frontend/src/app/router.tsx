import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import RequestsPage from '../pages/requests/RequestsPage';
import RequestDetailPage from '../pages/requests/RequestDetailPage';
import CreateRequestPage from '../pages/requests/CreateRequestPage';
import WorkflowPage from '../pages/workflow/WorkflowPage';
import UsersPage from '../pages/users/UsersPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import AuditPage from '../pages/audit/AuditPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AppRouter = () => (
  <Routes>
    <Route element={<AuthLayout />}> 
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route
      path="/"
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="requests" element={<RequestsPage />} />
      <Route path="requests/new" element={<CreateRequestPage />} />
      <Route path="requests/:requestId" element={<RequestDetailPage />} />
      <Route path="requests/:requestId/edit" element={<CreateRequestPage editMode />} />
      <Route path="workflow/:requestId" element={<WorkflowPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="audit" element={<AuditPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
