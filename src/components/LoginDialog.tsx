import React from 'react';
import { LoginForm } from './LoginForm';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface LoginDialogProps {
  onSuccess: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ onSuccess }) => {
  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Log in to continue</DialogTitle>
          <DialogDescription className="sr-only">
            Log in to access this page.
          </DialogDescription>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <LoginForm onSuccess={onSuccess} />
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
