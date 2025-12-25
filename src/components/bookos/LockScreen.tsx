import { useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LockScreenProps {
  onUnlock: (code: string) => Promise<boolean> | boolean;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = async (digit: string) => {
    if (code.length < 4) {
      const newCode = code + digit;
      setCode(newCode);
      setError(false);
      
      if (newCode.length === 4) {
        const result = await onUnlock(newCode);
        if (!result) {
          setError(true);
          setTimeout(() => {
            setCode('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
    setError(false);
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-xl font-medium text-foreground">BookOS</h1>
          <p className="text-sm text-muted-foreground">Entrez votre code</p>
        </div>

        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full transition-all duration-200',
                code.length > i ? 'bg-primary scale-110' : 'bg-muted',
                error && 'bg-destructive animate-pulse'
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {digits.map((digit, i) => (
            <button
              key={i}
              onClick={() => {
                if (digit === 'del') handleDelete();
                else if (digit) handleDigit(digit);
              }}
              disabled={!digit}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
                digit && 'bg-secondary hover:bg-secondary/80 active:scale-95',
                !digit && 'invisible'
              )}
            >
              {digit === 'del' ? (
                <Delete className="w-6 h-6 text-foreground" />
              ) : (
                <span className="text-xl font-medium text-foreground">{digit}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
