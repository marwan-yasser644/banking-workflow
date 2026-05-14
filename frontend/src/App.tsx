<<<<<<< HEAD
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

// Pages
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RequestsPage } from '@/pages/RequestsPage'
import { WorkflowPage } from '@/pages/WorkflowPage'
import { UsersPage } from '@/pages/UsersPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { AuditPage } from '@/pages/AuditPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  const { isDarkMode } = useAuthStore()

  useEffect(() => {
    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/requests" element={
          <ProtectedRoute>
            <RequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/workflow" element={
          <ProtectedRoute>
            <WorkflowPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute>
            <AuditPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
=======
import { AuthProvider } from './auth/AuthContext';
import { AppRouter } from './app/router';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
>>>>>>> 2c26bb1eb455214f77113d5d43609d94c252cf3c
