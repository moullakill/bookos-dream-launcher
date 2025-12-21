import { App } from '@/types/bookos';
import { AppIcon } from './AppIcon';

interface HomeViewProps {
  apps: App[];
  onOpenApp: (app: App) => void;
  onEditApp: (app: App) => void;
  iconSize?: number;
}

export function HomeView({ apps, onOpenApp, onEditApp, iconSize = 64 }: HomeViewProps) {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-4 gap-4 justify-items-center">
        {apps.map((app) => (
          <AppIcon
            key={app.id}
            app={app}
            onClick={() => onOpenApp(app)}
            onLongPress={() => onEditApp(app)}
            iconSize={iconSize}
          />
        ))}
      </div>
      {apps.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p className="text-center">Aucune application</p>
          <p className="text-sm">Appuyez sur + pour ajouter</p>
        </div>
      )}
    </div>
  );
}
