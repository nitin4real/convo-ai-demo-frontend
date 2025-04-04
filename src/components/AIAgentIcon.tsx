import React from 'react';
import { cn } from '@/lib/utils';

interface AIAgentIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pulse' | 'glow';
  color?: 'primary' | 'secondary' | 'accent';
}

export const AIAgentIcon: React.FC<AIAgentIconProps> = ({ 
  className,
  size = 'md',
  variant = 'default',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent'
  };

  const variantClasses = {
    default: '',
    pulse: 'animate-pulse',
    glow: 'drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]'
  };

  return (
    <div className={cn(
      "relative inline-block",
      sizeClasses[size],
      variantClasses[variant],
      colorClasses[color],
      className
    )}>
      {variant === 'glow' && (
        <div className="absolute inset-0 animate-pulse">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm" />
        </div>
      )}
      <svg 
        className={cn(
          "relative z-10 w-full h-full",
          variant === 'glow' && 'drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]'
        )}
        viewBox="0 0 48 48" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fill="currentColor" 
          fillRule="evenodd" 
          d="M29.032 15.093C28.178 14.682 27.181 14.33 26 14c1.18-.331 2.178-.682 3.032-1.093c1.822-.876 2.988-2.03 3.875-3.864C33.319 8.189 33.67 7.189 34 6c.33 1.189.68 2.19 1.093 3.043c.887 1.835 2.053 2.988 3.875 3.864c.853.411 1.851.762 3.032 1.093c-1.18.331-2.178.682-3.032 1.093c-1.822.877-2.988 2.03-3.875 3.864c-.412.854-.764 1.854-1.093 3.043c-.33-1.189-.68-2.19-1.093-3.043c-.887-1.835-2.053-2.988-3.875-3.864m3.69.146A9.5 9.5 0 0 0 31.173 14a9.5 9.5 0 0 0 1.55-1.24A9.5 9.5 0 0 0 34 11.18a9.4 9.4 0 0 0 1.278 1.582c.474.47.99.878 1.549 1.239a9.5 9.5 0 0 0-1.55 1.24A9.5 9.5 0 0 0 34 16.82a9.5 9.5 0 0 0-1.278-1.582M9.304 29.064A41 41 0 0 0 6 28a41 41 0 0 0 3.304-1.064c5.083-1.906 7.707-4.477 9.632-9.612A40 40 0 0 0 20 14a40 40 0 0 0 1.064 3.324c1.925 5.135 4.55 7.706 9.632 9.612c1.002.376 2.098.726 3.304 1.064a41 41 0 0 0-3.304 1.064c-5.083 1.906-7.707 4.477-9.632 9.612A40 40 0 0 0 20 42a40 40 0 0 0-1.064-3.324c-1.925-5.135-4.55-7.706-9.632-9.612m7.403 2.17c-1.343-1.334-2.916-2.37-4.765-3.234c1.849-.864 3.422-1.9 4.765-3.233c1.355-1.345 2.412-2.93 3.293-4.808c.88 1.878 1.938 3.463 3.293 4.808c1.343 1.333 2.916 2.369 4.765 3.233c-1.849.864-3.422 1.9-4.765 3.233c-1.355 1.345-2.412 2.93-3.293 4.808c-.88-1.878-1.938-3.463-3.293-4.807" 
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};