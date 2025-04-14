import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu';
import { Settings, User, LogOut, MessageSquare, LogIn, Users, LayoutDashboard, Sun, Moon, Monitor } from 'lucide-react';
import { APP_CONFIG } from '../config/app.config';
import { FeedbackDialogRef } from './FeedbackDialog';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  feedbackDialogRef?: React.RefObject<FeedbackDialogRef | null>;
}

const Header: React.FC<HeaderProps> = ({ feedbackDialogRef }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!authService.getToken();
  const { setTheme } = useTheme();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{APP_CONFIG.NAME}</h1>
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-2">
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/agents')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  All Agents
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => feedbackDialogRef?.current?.open()}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </Button>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
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
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4" />
                        Theme
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                          <Sun className="mr-2 h-4 w-4" />
                          Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                          <Moon className="mr-2 h-4 w-4" />
                          Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>
                          <Monitor className="mr-2 h-4 w-4" />
                          System
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
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
              </>
            ) : (
              <Button 
                variant="default"
                onClick={handleLogin}
                size="sm"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 