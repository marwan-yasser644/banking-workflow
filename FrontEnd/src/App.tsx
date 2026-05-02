import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import LoginPage         from '@/pages/LoginPage'
import DashboardPage     from '@/pages/DashboardPage'
import LoansPage         from '@/pages/LoansPage'
import CreateLoanPage    from '@/pages/CreateLoanPage'
import UsersPage         from '@/pages/UsersPage'
import NotificationsPage from '@/pages/NotificationsPage'
import AuditPage         from '@/pages/AuditPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
})

function RootRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'MAKER') return <Navigate to="/loans" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<RootRedirect />} />
                <Route path="/dashboard" element={<ProtectedRoute roles={['ADMIN','CHECKER','APPROVER']}><DashboardPage /></ProtectedRoute>} />
                <Route path="/loans" element={<LoansPage />} />
                <Route path="/loans/create" element={<ProtectedRoute roles={['MAKER','ADMIN']}><CreateLoanPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/audit" element={<ProtectedRoute roles={['ADMIN','CHECKER','APPROVER']}><AuditPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}