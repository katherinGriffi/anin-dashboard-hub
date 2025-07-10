
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Login from '@/components/Login';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/general" replace />;
  }

  return <Login />;
};

export default Index;
