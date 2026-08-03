import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  allowedRoles: Array<'Patient' | 'Doctor' | 'Admin'>
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()

  const isDevBypass = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  if (!isDevBypass && (!isAuthenticated || !user)) {
    return <Navigate to="/login" replace />
  }

  if (!isDevBypass && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
