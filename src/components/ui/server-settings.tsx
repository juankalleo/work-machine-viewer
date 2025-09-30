import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { 
  Settings, 
  Server, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Wifi,
  Info
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface ServerSettingsProps {
  currentServerUrl: string;
  isOnline: boolean;
  onServerChange?: (url: string, isOnline: boolean) => void;
  trigger?: React.ReactNode;
}

export function ServerSettings({
  currentServerUrl,
  isOnline,
  onServerChange,
  trigger
}: ServerSettingsProps) {
  const [open, setOpen] = useState(false);
  const [serverUrl, setServerUrl] = useState(currentServerUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    setServerUrl(currentServerUrl);
  }, [currentServerUrl]);

  const testConnection = async (url: string) => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const cleanUrl = url.replace(/\/$/, ''); // Remove trailing slash
      const response = await fetch(`${cleanUrl}/api/health`, {
        method: 'GET',
        timeout: 5000,
      } as any);

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `Conectado com sucesso! ${data.message || ''}`
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro de conexão'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!testResult?.success) {
      await testConnection(serverUrl);
      return;
    }

    try {
      const success = await apiClient.setServerUrl(serverUrl);
      if (success) {
        onServerChange?.(serverUrl, true);
        setOpen(false);
      } else {
        setTestResult({
          success: false,
          message: 'Falha ao configurar servidor'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao salvar configurações'
      });
    }
  };

  const getStatusIcon = () => {
    if (isTestingConnection) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (testResult?.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (testResult && !testResult.success) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Server className="h-4 w-4 text-muted-foreground" />;
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Settings className="h-4 w-4" />
    </Button>
  );

  const suggestedServers = [
    { url: 'http://localhost:3001', description: 'Servidor local' },
    { url: 'http://10.46.0.213:3001', description: 'Servidor da rede (GTI)' },
    { url: 'http://192.168.1.100:3001', description: 'Servidor da rede local' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Servidor
          </DialogTitle>
          <DialogDescription>
            Configure o endereço do servidor backend para sincronização multi-dispositivo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status atual */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium">Status atual:</span>
                </div>
                <Badge variant={isOnline ? 'default' : 'secondary'}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
              </div>
              {currentServerUrl && (
                <p className="text-xs text-muted-foreground mt-2">
                  {isOnline ? `Conectado a: ${currentServerUrl}` : 'Servidor não acessível'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Configuração do servidor */}
          <div className="space-y-2">
            <Label htmlFor="server-url">Endereço do Servidor</Label>
            <div className="flex space-x-2">
              <Input
                id="server-url"
                type="url"
                placeholder="http://localhost:3001"
                value={serverUrl}
                onChange={(e) => {
                  setServerUrl(e.target.value);
                  setTestResult(null); // Reset test result when URL changes
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => testConnection(serverUrl)}
                disabled={isTestingConnection || !serverUrl.trim()}
              >
                {getStatusIcon()}
                {isTestingConnection ? 'Testando...' : 'Testar'}
              </Button>
            </div>
            
            {testResult && (
              <div className={`flex items-start space-x-2 p-3 rounded-md text-sm ${
                testResult.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Servidores sugeridos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Info className="h-3 w-3" />
              Servidores Sugeridos
            </Label>
            <div className="space-y-1">
              {suggestedServers.map((server, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setServerUrl(server.url);
                    setTestResult(null);
                  }}
                  className="w-full text-left p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-blue-600">{server.url}</span>
                    {serverUrl === server.url && (
                      <Badge variant="secondary" className="text-xs">Selecionado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{server.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Dica:</p>
                <p className="mt-1">
                  O sistema tenta encontrar o servidor automaticamente. Configure manualmente apenas se necessário.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!serverUrl.trim() || isTestingConnection}
          >
            {testResult?.success ? 'Salvar' : 'Testar e Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}