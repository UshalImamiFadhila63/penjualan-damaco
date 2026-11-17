import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Customer mencoba masuk ke halaman admin → kembali ke katalog
    // Admin mencoba masuk ke halaman customer → masuk ke dashboard
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
