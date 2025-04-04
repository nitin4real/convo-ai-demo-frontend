import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Settings, User, History, Star, LogOut, MessageSquare } from 'lucide-react';
import { APP_CONFIG } from '../config/app.config';
import { FeedbackDialogRef } from './FeedbackDialog';

interface HeaderProps {
  feedbackDialogRef?: React.RefObject<FeedbackDialogRef | null>;
}

const Header: React.FC<HeaderProps> = ({ feedbackDialogRef }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{APP_CONFIG.NAME}</h1>
            <nav className="hidden md:flex space-x-2">
              <Button 
                variant="ghost"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button variant="ghost">
                <Star className="mr-2 h-4 w-4" />
                Favorites
              </Button>
              <Button variant="ghost">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              <Button 
                variant="ghost"
                onClick={() => feedbackDialogRef?.current?.open()}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Feedback
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="destructive"
              onClick={handleLogout}
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 