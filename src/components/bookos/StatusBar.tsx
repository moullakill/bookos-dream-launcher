import { Battery, Wifi, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function StatusBar() {
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
      <span className="font-display font-medium text-foreground">BookOS</span>
      <div className="flex items-center gap-2">
        <Wifi className="w-3 h-3" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
}
