import React, { useState, useEffect, useRef } from 'react';

export interface TimerProps {
  /** Duration in seconds */
  duration: number;
  /** Callback when timer completes */
  onComplete?: () => void;
  /** Show circular progress ring */
  showProgress?: boolean;
  /** Visual variant */
  variant?: 'default' | 'warning' | 'danger';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Inline styles for the root element */
  style?: React.CSSProperties;
  /** Auto-start timer on mount */
  autoStart?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16 text-lg',
  md: 'w-24 h-24 text-3xl',
  lg: 'w-32 h-32 text-5xl',
};

const variantColors = {
  default: 'text-indigo-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
};

const progressColors = {
  default: '#6366f1',
  warning: '#f59e0b',
  danger: '#ef4444',
};

/**
 * Countdown timer with visual feedback and optional progress ring
 * Automatically transitions between variants based on remaining time
 */
export const Timer: React.FC<TimerProps> = ({
  duration,
  onComplete,
  showProgress = true,
  variant: initialVariant = 'default',
  size = 'md',
  className = '',
  style,
  autoStart = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Determine variant based on time left
  const getVariant = (): 'default' | 'warning' | 'danger' => {
    if (initialVariant !== 'default') return initialVariant;
    const percentLeft = (timeLeft / duration) * 100;
    if (percentLeft <= 25) return 'danger';
    if (percentLeft <= 50) return 'warning';
    return 'default';
  };

  const currentVariant = getVariant();

  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = performance.now();
    const initialTimeLeft = timeLeft;

    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTimeRef.current!) / 1000;
      const newTimeLeft = Math.max(0, initialTimeLeft - elapsed);

      setTimeLeft(newTimeLeft);

      if (newTimeLeft > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, timeLeft, onComplete]);

  const displayTime = Math.ceil(timeLeft);
  const progress = (timeLeft / duration) * 100;

  // SVG circle properties
  const radius = size === 'sm' ? 28 : size === 'md' ? 44 : 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}
      style={style}
      role="timer"
      aria-live="polite"
      aria-label={`${displayTime} seconds remaining`}
    >
      {/* Progress ring */}
      {showProgress && (
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox={`0 0 ${radius * 2 + 8} ${radius * 2 + 8}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            stroke={progressColors[currentVariant]}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>
      )}

      {/* Time display */}
      <span className={`font-bold ${variantColors[currentVariant]} z-10`}>
        {displayTime}
      </span>
    </div>
  );
};
