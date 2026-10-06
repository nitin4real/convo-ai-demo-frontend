import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import LoginDialog from './LoginDialog';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authService.getToken());

  if (!isAuthenticated) {
    return <LoginDialog onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
