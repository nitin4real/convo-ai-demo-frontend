import { handleUserErrors } from '@/utils/toast.utils';
import { Eye, EyeOff } from 'lucide-react';
import React, { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { APP_CONFIG } from '../config/app.config';
import { authService } from '../services/auth.service';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AgoraAIRec from '@/assets/agora-blue.svg';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await authService.login({
        id: parseInt(id),
        password,
      });
      toast.success('Login successful');
      onSuccess();
    } catch (err: unknown) {
      handleUserErrors(err);
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <img src={AgoraAIRec} alt="Agora AI Rec" className="h-30" />
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome to {APP_CONFIG.NAME}
        </CardTitle>
      </CardHeader>
      {error && (
        <div className="px-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              type="number"
              id="id"
              value={id}
              onChange={(event) => setId(event.target.value)}
              placeholder="Enter your ID"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="px-8 text-center text-sm text-muted-foreground">
          Enter your ID and password to access the {APP_CONFIG.SHORT_NAME}
        </p>
      </CardFooter>
    </>
  );
};
