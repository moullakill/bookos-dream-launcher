import { Theme } from '@/types/bookos';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const themes: Theme[] = [
  {
    id: 'paper',
    name: 'Paper',
    className: '',
    preview: { bg: '#f5f3ef', accent: '#c45a1a', text: '#2d2a26' },
  },
  {
    id: 'dark',
    name: 'Dark',
    className: 'theme-dark',
    preview: { bg: '#1a1d24', accent: '#e8a23a', text: '#e5e7eb' },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    className: 'theme-sepia',
    preview: { bg: '#e8dfd1', accent: '#8b5a2b', text: '#3d3022' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    className: 'theme-ocean',
    preview: { bg: '#1c2a35', accent: '#2dd4bf', text: '#e5eef5' },
  },
];

interface ThemeSelectorProps {
  currentTheme: string;
  onSelect: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect(theme.id)}
          className={cn(
            'relative p-3 rounded-xl border-2 transition-all duration-200',
            currentTheme === theme.id
              ? 'border-primary shadow-md'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div
            className="w-full h-16 rounded-lg mb-2 flex items-center justify-center"
            style={{ backgroundColor: theme.preview.bg }}
          >
            <div
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: theme.preview.accent }}
            />
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: theme.preview.text }}
          >
            {theme.name}
          </p>
          {currentTheme === theme.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function getThemeClass(themeId: string): string {
  const theme = themes.find(t => t.id === themeId);
  return theme?.className || '';
}
