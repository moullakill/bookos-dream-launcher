import { useState } from 'react';
import { Settings } from '@/types/bookos';
import { ThemeSelector } from './ThemeSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Lock, Unlock, Image, Palette, Maximize, BookOpen, Grid3X3 } from 'lucide-react';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (updates: Partial<Settings>) => void;
  onSetLockCode: (code: string | undefined) => void;
  onLock: () => void;
}

export function SettingsPanel({ 
  settings, 
  onUpdateSettings, 
  onSetLockCode,
  onLock 
}: SettingsPanelProps) {
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showCodeForm, setShowCodeForm] = useState(false);

  const handleSetCode = () => {
    if (newCode.length === 4 && newCode === confirmCode) {
      onSetLockCode(newCode);
      setNewCode('');
      setConfirmCode('');
      setShowCodeForm(false);
    }
  };

  const handleRemoveCode = () => {
    onSetLockCode(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Theme Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Palette className="w-4 h-4" />
          <h3 className="text-sm font-medium">Thème</h3>
        </div>
        <ThemeSelector
          currentTheme={settings.theme}
          onSelect={(themeId) => onUpdateSettings({ theme: themeId })}
        />
      </section>

      {/* Background Image Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Image className="w-4 h-4" />
          <h3 className="text-sm font-medium">Image de fond</h3>
        </div>
        <Input
          value={settings.backgroundImage || ''}
          onChange={(e) => onUpdateSettings({ backgroundImage: e.target.value || undefined })}
          placeholder="URL de l'image (optionnel)"
        />
        {settings.backgroundImage && (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Flou: {settings.backgroundBlur}px</Label>
              <Slider
                value={[settings.backgroundBlur]}
                onValueChange={([value]) => onUpdateSettings({ backgroundBlur: value })}
                min={0}
                max={20}
                step={1}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onUpdateSettings({ backgroundImage: undefined })}
            >
              Supprimer l'image
            </Button>
          </>
        )}
      </section>

      {/* Icon Sizes Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Maximize className="w-4 h-4" />
          <h3 className="text-sm font-medium">Taille des éléments</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Icônes d'application: {settings.appIconSize}px</Label>
            </div>
            <Slider
              value={[settings.appIconSize]}
              onValueChange={([value]) => onUpdateSettings({ appIconSize: value })}
              min={48}
              max={96}
              step={4}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground">Couvertures de livre: {settings.bookCardSize}px</Label>
            </div>
            <Slider
              value={[settings.bookCardSize]}
              onValueChange={([value]) => onUpdateSettings({ bookCardSize: value })}
              min={60}
              max={120}
              step={4}
            />
          </div>
        </div>
      </section>

      {/* Lock Code Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="w-4 h-4" />
          <h3 className="text-sm font-medium">Code de verrouillage</h3>
        </div>

        {settings.lockCode ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
              <span className="text-sm">Code activé (****)</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onLock}>
                  <Lock className="w-4 h-4 mr-1" />
                  Verrouiller
                </Button>
                <Button variant="destructive" size="sm" onClick={handleRemoveCode}>
                  <Unlock className="w-4 h-4 mr-1" />
                  Désactiver
                </Button>
              </div>
            </div>
          </div>
        ) : showCodeForm ? (
          <div className="space-y-3 p-3 rounded-lg bg-secondary">
            <div className="space-y-2">
              <Label>Nouveau code (4 chiffres)</Label>
              <Input
                type="password"
                maxLength={4}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmer le code</Label>
              <Input
                type="password"
                maxLength={4}
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowCodeForm(false);
                  setNewCode('');
                  setConfirmCode('');
                }}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSetCode}
                disabled={newCode.length !== 4 || newCode !== confirmCode}
              >
                Activer
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowCodeForm(true)}>
            <Lock className="w-4 h-4 mr-2" />
            Définir un code
          </Button>
        )}
      </section>
    </div>
  );
}
