import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STAFF_ROLES = [
  'BRANCH_MANAGER',
  'KITCHEN_STAFF',
  'WAITER',
  'INVENTORY_MANAGER',
  'HEADQUARTERS_MANAGER',
  'ADMIN'
];

const StaffRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user && STAFF_ROLES.includes(user.role)) {
    return <Navigate to='/dashboard' replace />;
  }
  return <>{children}</>;
};

export default StaffRedirect;