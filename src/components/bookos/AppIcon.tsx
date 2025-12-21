import { App } from '@/types/bookos';
import { cn } from '@/lib/utils';

interface AppIconProps {
  app: App;
  onClick: () => void;
  onLongPress?: () => void;
  iconSize?: number; // size in pixels
}

export function AppIcon({ app, onClick, onLongPress, iconSize = 64 }: AppIconProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onLongPress?.();
  };

  // Calculate font size based on icon size
  const fontSize = Math.round(iconSize * 0.4);

  return (
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className="icon-button group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          'icon-circle group-active:scale-90'
        )}
        style={{ width: iconSize, height: iconSize, fontSize }}
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
