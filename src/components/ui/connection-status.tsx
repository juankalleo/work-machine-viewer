import React from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Users, 
  Clock,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isOnline: boolean;
  serverUrl: string;
  lastSync: Date | null;
  connectedDevices: number;
  isPolling: boolean;
  onSyncNow?: () => void;
  onSettings?: () => void;
  className?: string;
  compact?: boolean;
}

export function ConnectionStatus({
  isOnline,
  serverUrl,
  lastSync,
  connectedDevices,
  isPolling,
  onSyncNow,
  onSettings,
  className,
  compact = false
}: ConnectionStatusProps) {
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (isOnline) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return <Wifi className={cn("h-4 w-4", getStatusColor())} />;
    }
    return <WifiOff className={cn("h-4 w-4", getStatusColor())} />;
  };

  const getStatusBadge = () => {
    if (isOnline) {
      return (
        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Online
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
        <AlertCircle className="h-3 w-3 mr-1" />
        Offline
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {getStatusIcon()}
        {getStatusBadge()}
        {isPolling && isOnline && (
          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
        )}
      </div>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Status da Conexão</span>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {onSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          {isOnline 
            ? `Conectado ao servidor: ${serverUrl}`
            : 'Trabalhando offline - dados em cache local'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Estatísticas de conexão */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Dispositivos:</span>
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {connectedDevices}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Última sync:</span>
            <span className="text-xs font-medium">
              {formatLastSync(lastSync)}
            </span>
          </div>
        </div>

        {/* Status de sincronização */}
        {isOnline && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {isPolling ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                  <span className="text-blue-600">Sincronizando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Sincronizado</span>
                </>
              )}
            </div>
            
            {onSyncNow && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSyncNow}
                disabled={isPolling}
                className="h-6 text-xs px-2"
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", isPolling && "animate-spin")} />
                Sync
              </Button>
            )}
          </div>
        )}

        {/* Mensagem de offline */}
        {!isOnline && (
          <div className="flex items-start space-x-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Modo Offline</p>
              <p className="text-amber-700 mt-1">
                Seus dados estão salvos localmente. Conecte ao servidor para sincronizar com outros dispositivos.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente compacto para barra de status
export function ConnectionIndicator({
  isOnline,
  isPolling,
  onSyncNow,
  className
}: {
  isOnline: boolean;
  isPolling: boolean;
  onSyncNow?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-2 text-xs", className)}>
      {isOnline ? (
        <div className="flex items-center space-x-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span>Offline</span>
        </div>
      )}
      
      {isPolling && isOnline && (
        <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
      )}
      
      {onSyncNow && isOnline && (
        <button
          onClick={onSyncNow}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          disabled={isPolling}
        >
          <RefreshCw className={cn("h-3 w-3", isPolling && "animate-spin")} />
        </button>
      )}
    </div>
  );
}