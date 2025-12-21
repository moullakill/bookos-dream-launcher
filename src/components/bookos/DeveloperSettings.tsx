import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Play, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DevCommand {
  id: string;
  name: string;
  command: string;
  description: string;
}

interface DeveloperSettingsProps {
  onClose: () => void;
}

export function DeveloperSettings({ onClose }: DeveloperSettingsProps) {
  const [commands, setCommands] = useState<DevCommand[]>([]);
  const [customCommand, setCustomCommand] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [commandOutput, setCommandOutput] = useState<string>('');

  useEffect(() => {
    // Load predefined commands from JSON
    fetch('/dev-commands.json')
      .then(res => res.json())
      .then(data => {
        setCommands(data.commands || []);
        setIsLoading(false);
      })
      .catch(() => {
        setCommands([]);
        setIsLoading(false);
      });
  }, []);

  const executeCommand = async (command: string, id?: string) => {
    setExecutingId(id || 'custom');
    setCommandOutput('');
    
    try {
      const response = await fetch('http://localhost:8080/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCommandOutput(data.output || 'Commande exécutée avec succès');
        toast.success('Commande exécutée');
      } else {
        setCommandOutput(data.error || 'Erreur lors de l\'exécution');
        toast.error('Erreur: ' + (data.error || 'Échec de la commande'));
      }
    } catch (error) {
      const errorMsg = 'Impossible de contacter le backend';
      setCommandOutput(errorMsg);
      toast.error(errorMsg);
    } finally {
      setExecutingId(null);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCommand.trim()) {
      executeCommand(customCommand);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <p className="text-sm text-destructive">
          Mode développeur - Ces commandes s'exécutent sur la machine
        </p>
      </div>

      {/* Predefined Commands */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <h3 className="text-sm font-medium">Commandes prédéfinies</h3>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : commands.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Aucune commande prédéfinie dans dev-commands.json
          </p>
        ) : (
          <div className="space-y-2">
            {commands.map((cmd) => (
              <div 
                key={cmd.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{cmd.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                  <code className="text-[10px] text-muted-foreground/70 font-mono">
                    {cmd.command}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => executeCommand(cmd.command, cmd.id)}
                  disabled={executingId !== null}
                  className="ml-2 shrink-0"
                >
                  {executingId === cmd.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Custom Command */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Terminal className="w-4 h-4" />
          <h3 className="text-sm font-medium">Commande personnalisée</h3>
        </div>
        
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="customCmd">Commande</Label>
            <Input
              id="customCmd"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder="Ex: ls -la /home/user"
              className="font-mono text-sm"
            />
          </div>
          <Button 
            type="submit" 
            disabled={!customCommand.trim() || executingId !== null}
            className="w-full"
          >
            {executingId === 'custom' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exécution...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Exécuter
              </>
            )}
          </Button>
        </form>
      </section>

      {/* Command Output */}
      {commandOutput && (
        <section className="space-y-2">
          <Label>Sortie</Label>
          <Textarea
            value={commandOutput}
            readOnly
            className="font-mono text-xs h-32 bg-muted"
          />
        </section>
      )}

      <Button variant="outline" onClick={onClose} className="w-full">
        Fermer
      </Button>
    </div>
  );
}
