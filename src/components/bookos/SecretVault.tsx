import { useState } from 'react';
import { Lock, Plus, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecretItem } from '@/types/bookos';
import { cn } from '@/lib/utils';

interface SecretVaultProps {
  secrets: SecretItem[];
  onAddSecret: (secret: Omit<SecretItem, 'id'>) => void;
  onDeleteSecret: (id: string) => void;
  onClose: () => void;
}

export function SecretVault({ secrets, onAddSecret, onDeleteSecret, onClose }: SecretVaultProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showUrls, setShowUrls] = useState(false);
  const [newSecret, setNewSecret] = useState({
    name: '',
    url: '',
    type: 'link' as 'link' | 'app',
    icon: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSecret.name && newSecret.url) {
      onAddSecret({
        name: newSecret.name,
        url: newSecret.url,
        type: newSecret.type,
        icon: newSecret.icon || '🔒'
      });
      setNewSecret({ name: '', url: '', type: 'link', icon: '' });
      setIsAdding(false);
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card/95 backdrop-blur-md rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Coffre Secret</h2>
                <p className="text-xs text-muted-foreground">{secrets.length} éléments cachés</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Toggle URL visibility */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Afficher les URLs</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUrls(!showUrls)}
              className="gap-2"
            >
              {showUrls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          {/* Secret items list */}
          {secrets.length === 0 && !isAdding ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun secret enregistré</p>
              <p className="text-xs mt-1">Ajoutez des liens et apps secrets</p>
            </div>
          ) : (
            <div className="space-y-2">
              {secrets.map((secret) => (
                <div
                  key={secret.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors group"
                >
                  <span className="text-2xl">{secret.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{secret.name}</p>
                    <p className={cn(
                      "text-xs text-muted-foreground truncate",
                      !showUrls && "blur-sm select-none"
                    )}>
                      {secret.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpen(secret.url)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDeleteSecret(secret.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-background/50 border border-border/30 space-y-3">
              <div>
                <Label htmlFor="secret-name" className="text-xs">Nom</Label>
                <Input
                  id="secret-name"
                  value={newSecret.name}
                  onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
                  placeholder="Mon secret..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="secret-url" className="text-xs">URL</Label>
                <Input
                  id="secret-url"
                  value={newSecret.url}
                  onChange={(e) => setNewSecret({ ...newSecret, url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="secret-icon" className="text-xs">Icône (emoji)</Label>
                <Input
                  id="secret-icon"
                  value={newSecret.icon}
                  onChange={(e) => setNewSecret({ ...newSecret, icon: e.target.value })}
                  placeholder="🔒"
                  className="mt-1"
                  maxLength={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newSecret.type === 'link' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewSecret({ ...newSecret, type: 'link' })}
                >
                  Lien
                </Button>
                <Button
                  type="button"
                  variant={newSecret.type === 'app' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewSecret({ ...newSecret, type: 'app' })}
                >
                  App
                </Button>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Ajouter
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isAdding && (
          <div className="p-4 border-t border-border/50">
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un secret
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
