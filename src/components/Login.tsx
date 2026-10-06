import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { Card } from './ui/card';


const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <LoginForm onSuccess={() => navigate('/agents')} />
      </Card>
    </div>
  );
};

export default Login;
