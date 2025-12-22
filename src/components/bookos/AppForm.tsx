import { useState } from 'react';
import { App } from '@/types/bookos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageIcon } from 'lucide-react';

interface AppFormProps {
  app?: App;
  onSave: (app: Omit<App, 'id'>) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

const emojiIcons = ['📚', '📖', '🎵', '🎬', '🌐', '📰', '💼', '🎮', '📝', '🔧', '📷', '🎨'];

export function AppForm({ app, onSave, onDelete, onCancel }: AppFormProps) {
  const [name, setName] = useState(app?.name || '');
  const [url, setUrl] = useState(app?.url || '');
  const [icon, setIcon] = useState(app?.icon || '📱');
  const [isPath, setIsPath] = useState(app?.isPath || false);
  const [useImageIcon, setUseImageIcon] = useState(
    app?.icon?.startsWith('http') || app?.icon?.startsWith('/') || false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      onSave({ name, url, icon, isPath });
    }
  };

  const isImageUrl = icon.startsWith('http') || icon.startsWith('/');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'application</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Kindle, Calibre..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">
          {isPath ? 'Chemin local' : 'URL'}
        </Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={isPath ? '/app/calibre' : 'https://...'}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isPath">Chemin local (vs URL)</Label>
        <Switch
          id="isPath"
          checked={isPath}
          onCheckedChange={setIsPath}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Icône</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Image URL</span>
            <Switch
              checked={useImageIcon}
              onCheckedChange={(checked) => {
                setUseImageIcon(checked);
                if (checked) {
                  setIcon('');
                } else {
                  setIcon('📱');
                }
              }}
            />
          </div>
        </div>

        {useImageIcon ? (
          <div className="space-y-3">
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://example.com/icon.png ou /icons/app.png"
            />
            {/* Preview */}
            <div className="flex items-center justify-center p-4 rounded-lg bg-secondary">
              {isImageUrl ? (
                <img 
                  src={icon} 
                  alt="Preview"
                  className="w-16 h-16 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {emojiIcons.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === emoji
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Emoji personnalisé"
              className="mt-2"
            />
          </>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete} className="flex-1">
            Supprimer
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {app ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
