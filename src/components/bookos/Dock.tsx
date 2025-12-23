import { useState, useRef, useEffect } from 'react';
import { Library, Grid3X3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DockProps {
  activeView: 'home' | 'library' | 'settings';
  onViewChange: (view: 'home' | 'library' | 'settings') => void;
  onAddApp: () => void;
  onAddBook: () => void;
  onOpenSecretVault: () => void;
}

export function Dock({ activeView, onViewChange, onAddApp, onAddBook, onOpenSecretVault }: DockProps) {
  const [libraryClickCount, setLibraryClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const items = [
    { id: 'home' as const, icon: Grid3X3, label: 'Apps' },
    { id: 'library' as const, icon: Library, label: 'Livres' },
    { id: 'settings' as const, icon: Settings, label: 'Réglages' },
  ];

  const handleItemClick = (id: 'home' | 'library' | 'settings') => {
    if (id === 'library') {
      const newCount = libraryClickCount + 1;
      setLibraryClickCount(newCount);

      // Reset timeout on each click
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      // Check if 5 clicks reached
      if (newCount >= 5) {
        setLibraryClickCount(0);
        onOpenSecretVault();
        return;
      }

      // Reset after 2 seconds of inactivity
      clickTimeoutRef.current = setTimeout(() => {
        setLibraryClickCount(0);
      }, 2000);
    } else {
      setLibraryClickCount(0);
    }

    onViewChange(id);
  };

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="dock-container px-4 py-2 flex items-center justify-center gap-6 shadow-dock">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleItemClick(item.id)}
          className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200',
            activeView === item.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
      
      <div className="w-px h-8 bg-border mx-2" />
      
      <button
        onClick={activeView === 'library' ? onAddBook : onAddApp}
        className="flex flex-col items-center gap-1 p-2 rounded-xl text-accent hover:text-accent/80 transition-colors"
      >
        <Plus className="w-6 h-6" />
        <span className="text-[10px] font-medium">
          {activeView === 'library' ? 'Livre' : 'App'}
        </span>
      </button>
    </div>
  );
}
