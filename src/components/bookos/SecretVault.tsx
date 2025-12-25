import { useState } from 'react';
import { Lock, Plus, Trash2, ExternalLink, Eye, EyeOff, Pencil, Image, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecretItem } from '@/types/bookos';
import { cn } from '@/lib/utils';

interface SecretVaultProps {
  secrets: SecretItem[];
  onAddSecret: (secret: Omit<SecretItem, 'id'>) => void;
  onUpdateSecret: (id: string, updates: Partial<SecretItem>) => void;
  onDeleteSecret: (id: string) => void;
  onOpenSecret: (secret: SecretItem) => void;
  onClose: () => void;
}

interface SecretFormData {
  name: string;
  url: string;
  type: 'link' | 'app';
  iconType: 'emoji' | 'image';
  icon: string;
}

const defaultFormData: SecretFormData = {
  name: '',
  url: '',
  type: 'link',
  iconType: 'emoji',
  icon: ''
};

export function SecretVault({ secrets, onAddSecret, onUpdateSecret, onDeleteSecret, onOpenSecret, onClose }: SecretVaultProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUrls, setShowUrls] = useState(false);
  const [formData, setFormData] = useState<SecretFormData>(defaultFormData);

  const resetForm = () => {
    setFormData(defaultFormData);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.url) {
      const secretData = {
        name: formData.name,
        url: formData.url,
        type: formData.type,
        iconType: formData.iconType,
        icon: formData.icon || (formData.iconType === 'emoji' ? '🔒' : '')
      };

      if (editingId) {
        onUpdateSecret(editingId, secretData);
      } else {
        onAddSecret(secretData);
      }
      resetForm();
    }
  };

  const handleEdit = (secret: SecretItem) => {
    setFormData({
      name: secret.name,
      url: secret.url,
      type: secret.type,
      iconType: secret.iconType,
      icon: secret.icon
    });
    setEditingId(secret.id);
    setIsAdding(false);
  };

  const handleOpen = (secret: SecretItem) => {
    // Delegate opening to backend via prop
    onOpenSecret(secret);
  };

  const renderIcon = (secret: SecretItem) => {
    if (secret.iconType === 'image' && secret.icon) {
      return (
        <img 
          src={secret.icon} 
          alt={secret.name} 
          className="w-10 h-10 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).className = 'hidden';
          }}
        />
      );
    }
    return <span className="text-2xl">{secret.icon || '🔒'}</span>;
  };

  const isFormOpen = isAdding || editingId !== null;

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
          {secrets.length === 0 && !isFormOpen ? (
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
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/30 transition-colors group",
                    editingId === secret.id && "ring-2 ring-primary/50"
                  )}
                >
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {renderIcon(secret)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground truncate">{secret.name}</p>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        secret.type === 'app' 
                          ? "bg-accent/20 text-accent-foreground" 
                          : "bg-primary/20 text-primary"
                      )}>
                        {secret.type === 'app' ? 'App' : 'Lien'}
                      </span>
                    </div>
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
                      onClick={() => handleEdit(secret)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpen(secret)}
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

          {/* Add/Edit form */}
          {isFormOpen && (
            <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-background/50 border border-border/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {editingId ? 'Modifier le secret' : 'Nouveau secret'}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={resetForm}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor="secret-name" className="text-xs">Nom</Label>
                <Input
                  id="secret-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mon secret..."
                  className="mt-1"
                />
              </div>

              {/* Type selection */}
              <div>
                <Label className="text-xs">Type</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={formData.type === 'link' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, type: 'link' })}
                  >
                    Lien URL
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'app' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setFormData({ ...formData, type: 'app' })}
                  >
                    Application
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="secret-url" className="text-xs">
                  {formData.type === 'app' ? "Chemin d'accès" : 'URL'}
                </Label>
                <Input
                  id="secret-url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={formData.type === 'app' ? '/chemin/vers/app' : 'https://...'}
                  className="mt-1"
                />
              </div>

              {/* Icon type selection */}
              <div>
                <Label className="text-xs">Type d'icône</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={formData.iconType === 'emoji' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setFormData({ ...formData, iconType: 'emoji', icon: '' })}
                  >
                    <Smile className="w-4 h-4" />
                    Émoji
                  </Button>
                  <Button
                    type="button"
                    variant={formData.iconType === 'image' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setFormData({ ...formData, iconType: 'image', icon: '' })}
                  >
                    <Image className="w-4 h-4" />
                    Image
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="secret-icon" className="text-xs">
                  {formData.iconType === 'emoji' ? 'Émoji' : 'URL de l\'image'}
                </Label>
                <Input
                  id="secret-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder={formData.iconType === 'emoji' ? '🔒' : 'https://example.com/image.png'}
                  className="mt-1"
                  maxLength={formData.iconType === 'emoji' ? 2 : undefined}
                />
                {formData.iconType === 'image' && formData.icon && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={formData.icon} 
                      alt="Aperçu" 
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  {editingId ? 'Enregistrer' : 'Ajouter'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isFormOpen && (
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