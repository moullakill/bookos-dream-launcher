import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StatusBarProps {
  onTitleClick?: () => void;
  titleClickCount?: number;
}

export function StatusBar({ onTitleClick, titleClickCount = 0 }: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2 text-muted-foreground text-xs">
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>
          {time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <button 
        onClick={onTitleClick}
        className="font-display font-medium text-foreground hover:text-primary transition-colors"
      >
        BookOS
        {titleClickCount > 0 && titleClickCount < 5 && (
          <span className="ml-1 text-[10px] text-muted-foreground">
            ({5 - titleClickCount})
          </span>
        )}
      </button>
      <div className="w-12" /> {/* Spacer for balance */}
    </div>
  );
}
