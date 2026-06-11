import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role as UserRole)) {
    return (
      <div className='min-h-screen bg-[var(--background)] flex items-center justify-center px-4'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-[var(--text)] mb-4'>Access Denied</h1>
          <p className='text-[var(--text-secondary)] mb-8'>You don't have permission to access this page.</p>
          <a href='/' className='btn-primary'>
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
