import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { fetchSystemStatus } from '@/lib/api';
import { SystemStatus } from '@/types/bookos';
import { 
  Cpu, MemoryStick, HardDrive, Monitor, Wifi, WifiOff, 
  Server, Clock, BookOpen, Grid3X3, Globe, CheckCircle2, XCircle 
} from 'lucide-react';

interface SystemStatusViewProps {
  appsCount: number;
  booksCount: number;
  sitesCount: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} Go`;
  return `${Math.round(mb)} Mo`;
}

function GaugeChart({ value, label, color }: { value: number; label: string; color: string }) {
  const data = [{ value, fill: color }];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-24 h-24 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="70%" outerRadius="100%"
            startAngle={90} endAngle={-270}
            data={data}
            barSize={8}
          >
            <RadialBar
              dataKey="value"
              background={{ fill: 'hsl(var(--muted))' }}
              cornerRadius={4}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function SystemStatusView({ appsCount, booksCount, sitesCount }: SystemStatusViewProps) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    const result = await fetchSystemStatus();
    if (result.success && result.data) {
      setStatus(result.data);
      setIsBackendOnline(true);
      setLastUpdate(new Date());
    } else {
      setIsBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const ramPercent = status ? (status.ram.used / status.ram.total) * 100 : 0;
  const cpuPercent = status?.cpu.usage ?? 0;
  const diskPercent = status ? (status.disk.used / status.disk.total) * 100 : 0;

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      <h1 className="font-display text-xl font-medium">Statut de la Liseuse</h1>

      {/* Backend Connection */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4" />
            Connexion Backend
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center gap-3">
            {isBackendOnline ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-destructive" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {isBackendOnline ? 'Connecté' : 'Hors ligne'}
              </p>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground">
                  Dernière MAJ: {lastUpdate.toLocaleTimeString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      {status && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Ressources Système
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex justify-around">
              <GaugeChart value={ramPercent} label="RAM" color="hsl(var(--primary))" />
              <GaugeChart value={cpuPercent} label="CPU" color="hsl(var(--accent))" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MemoryStick className="w-3 h-3" />
                {formatMB(status.ram.used)} / {formatMB(status.ram.total)}
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {status.cpu.cores} cœurs — {status.cpu.model}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disk Usage */}
      {status && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Stockage
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Progress value={diskPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatMB(status.disk.used)} utilisés sur {formatMB(status.disk.total)} — {formatMB(status.disk.free)} libres
            </p>
          </CardContent>
        </Card>
      )}

      {/* Database Stats */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4" />
            Base de Données
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
              <Grid3X3 className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{appsCount}</span>
              <span className="text-xs text-muted-foreground">Apps</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{booksCount}</span>
              <span className="text-xs text-muted-foreground">Livres</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{sitesCount}</span>
              <span className="text-xs text-muted-foreground">Sites</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      {status && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Informations Système
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">OS</span>
                <span className="text-foreground">{status.os.name} {status.os.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kernel</span>
                <span className="text-foreground">{status.os.kernel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Affichage</span>
                <span className="text-foreground">{status.display.server}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Résolution</span>
                <span className="text-foreground">{status.display.resolution}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Uptime</span>
                <span className="text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatUptime(status.uptime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network */}
      {status && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              {status.network.connected ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              Réseau
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">État</span>
                <span className={status.network.connected ? 'text-green-500' : 'text-destructive'}>
                  {status.network.connected ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
              {status.network.ip && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP</span>
                  <span className="text-foreground">{status.network.ip}</span>
                </div>
              )}
              {status.network.ssid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SSID</span>
                  <span className="text-foreground">{status.network.ssid}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
