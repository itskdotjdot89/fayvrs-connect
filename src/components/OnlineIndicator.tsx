import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  statusText?: string;
  className?: string;
}

export const OnlineIndicator = ({ 
  isOnline, 
  size = 'md', 
  showText = false,
  statusText,
  className 
}: OnlineIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (showText && statusText) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <div className={cn(
          'rounded-full',
          sizeClasses[size],
          isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        )} />
        <span className="text-xs text-muted-foreground">
          {statusText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full',
        sizeClasses[size],
        isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};
