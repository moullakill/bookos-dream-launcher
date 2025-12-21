import { App } from '@/types/bookos';
import { cn } from '@/lib/utils';

interface AppIconProps {
  app: App;
  onClick: () => void;
  onLongPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AppIcon({ app, onClick, onLongPress, size = 'md' }: AppIconProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress?.();
  };

  return (
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className="icon-button group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          'icon-circle',
          sizeClasses[size],
          'group-active:scale-90'
        )}
      >
        {app.icon.startsWith('http') || app.icon.startsWith('/') ? (
          <img 
            src={app.icon} 
            alt={app.name} 
            className="w-2/3 h-2/3 object-contain rounded-lg"
          />
        ) : (
          <span className="select-none">{app.icon || '📱'}</span>
        )}
      </div>
      <span className="text-xs font-medium text-foreground/80 max-w-[5rem] truncate">
        {app.name}
      </span>
    </button>
  );
}
