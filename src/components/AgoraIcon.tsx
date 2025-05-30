import { cn } from '@/lib/utils';
import React from 'react';

interface AgoraIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl';
  variant?: 'default' | 'pulse' | 'glow';
  color?: 'primary' | 'secondary' | 'accent';
}

export const AgoraIcon: React.FC<AgoraIconProps> = ({
  className,
  size = 'md',
  variant = 'default',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    xxl: 'w-20 h-20',
    xxxl: 'w-24 h-24',
    xxxxl: 'w-32 h-32'
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
    )}
    >
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
        style={{
          border: '1px solid red',
          paddingBottom: '10px'
        }}

        viewBox="0 12 24 12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M13.44 11.68a1.351 1.351 0 1 1 1.349-1.35a1.35 1.35 0 0 1-1.35 1.35m0-3.8a2.45 2.45 0 1 0 2.45 2.45a2.454 2.454 0 0 0-2.45-2.45m4.07.63l-.03.03l-.033.032l-.023-.04l-.019-.032a1.17 1.17 0 0 0-.87-.604l-.091-.018v4.902l.092-.012a1.14 1.14 0 0 0 1.008-1.154V10.33a1.36 1.36 0 0 1 1.21-1.342l.074-.009V7.881l-.088.01a2.1 2.1 0 0 0-1.235.622m-15.056 3.17a1.351 1.351 0 1 1 1.35-1.351a1.35 1.35 0 0 1-1.35 1.35M4.02 8.364L4 8.39l-.021.027l-.028-.02l-.026-.02a2.45 2.45 0 1 0-1.478 4.403a2.42 2.42 0 0 0 1.478-.498l.026-.019l.028-.022l.02.03l.02.027a1.17 1.17 0 0 0 .787.471l.09.013V7.88l-.09.012a1.17 1.17 0 0 0-.786.47m17.53 3.32a1.351 1.351 0 1 1 1.352-1.351a1.35 1.35 0 0 1-1.351 1.35m2.358-3.789a1.18 1.18 0 0 0-.788.47l-.019.027l-.02.029l-.028-.021l-.026-.02a2.45 2.45 0 1 0-1.478 4.4a2.42 2.42 0 0 0 1.478-.497l.026-.02l.028-.021l.02.028l.02.028a1.17 1.17 0 0 0 .787.472l.09.012v-4.9ZM7.978 8.98a1.351 1.351 0 1 1-1.353 1.35A1.35 1.35 0 0 1 7.98 8.98m1.53 3.261a2.444 2.444 0 0 0 .5-3.283a2 2 0 0 0-.112-.153a1.2 1.2 0 0 0 .524-.832l.014-.092H7.968a2.448 2.448 0 0 0-1.524 4.36a2.4 2.4 0 0 0-.293.274l.746.823A1.351 1.351 0 1 1 8.68 15.3l.748.823a2.447 2.447 0 0 0 .07-3.876"
        />
      </svg>
    </div>
  );
}; 