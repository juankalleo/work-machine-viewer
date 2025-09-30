// Hook para sincronização em tempo real entre dispositivos
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

interface SyncStatus {
  isOnline: boolean;
  serverUrl: string;
  lastSync: Date | null;
  connectedDevices: number;
}

interface SyncCallbacks {
  onDataUpdate?: () => void;
  onConnectionChange?: (status: SyncStatus) => void;
  onError?: (error: string) => void;
}

export function useRealTimeSync(callbacks?: SyncCallbacks) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    serverUrl: '',
    lastSync: null,
    connectedDevices: 1
  });
  
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataHashRef = useRef<string>('');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hash simples dos dados para detectar mudanças
  const generateDataHash = useCallback(async (): Promise<string> => {
    try {
      const [cpus, monitors] = await Promise.all([
        apiClient.getAllCPUs(),
        apiClient.getAllMonitors()
      ]);
      
      const dataString = JSON.stringify({
        cpusCount: cpus.length,
        monitorsCount: monitors.length,
        lastCpuUpdate: cpus[0]?.updated_at || '',
        lastMonitorUpdate: monitors[0]?.updated_at || ''
      });
      
      // Hash simples baseado no conteúdo
      let hash = 0;
      for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert para 32bit integer
      }
      return hash.toString();
    } catch (error) {
      console.error('Erro ao gerar hash dos dados:', error);
      return '';
    }
  }, []);

  // Verificar mudanças nos dados
  const checkForDataUpdates = useCallback(async () => {
    try {
      const currentHash = await generateDataHash();
      
      if (currentHash && currentHash !== lastDataHashRef.current) {
        console.log('🔄 Dados atualizados detectados, sincronizando...');
        lastDataHashRef.current = currentHash;
        
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date()
        }));
        
        callbacks?.onDataUpdate?.();
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      callbacks?.onError?.('Erro na sincronização');
    }
  }, [generateDataHash, callbacks]);

  // Inicializar hash inicial
  const initializeDataHash = useCallback(async () => {
    const initialHash = await generateDataHash();
    lastDataHashRef.current = initialHash;
  }, [generateDataHash]);

  // Polling para sincronização
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(() => {
      checkForDataUpdates();
    }, 5000); // Polling a cada 5 segundos

    setIsPolling(true);
    console.log('📡 Polling de sincronização iniciado');
  }, [checkForDataUpdates]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
    console.log('📡 Polling de sincronização parado');
  }, []);

  // Tentativa de reconexão
  const attemptReconnection = useCallback(() => {
    console.log('🔄 Tentando reconectar...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(async () => {
      await apiClient.syncNow();
      const status = apiClient.getConnectionStatus();
      
      if (status.isOnline) {
        console.log('✅ Reconectado com sucesso!');
        await initializeDataHash();
        startPolling();
      } else {
        // Tentar novamente em 30 segundos
        attemptReconnection();
      }
    }, 30000);
  }, [initializeDataHash, startPolling]);

  // Handle connection changes
  const handleConnectionChange = useCallback((event: any) => {
    const { isOnline, baseUrl } = event.detail;
    
    const newStatus: SyncStatus = {
      isOnline,
      serverUrl: baseUrl,
      lastSync: syncStatus.lastSync,
      connectedDevices: isOnline ? syncStatus.connectedDevices : 1
    };

    setSyncStatus(newStatus);
    callbacks?.onConnectionChange?.(newStatus);

    if (isOnline) {
      console.log('🌐 Conexão estabelecida, iniciando sincronização');
      initializeDataHash();
      startPolling();
    } else {
      console.log('📴 Conexão perdida, parando sincronização');
      stopPolling();
      attemptReconnection();
    }
  }, [syncStatus, callbacks, initializeDataHash, startPolling, stopPolling, attemptReconnection]);

  // Sincronização manual
  const syncNow = useCallback(async () => {
    try {
      console.log('🔄 Sincronização manual iniciada...');
      await apiClient.syncNow();
      await checkForDataUpdates();
      
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      
      console.log('✅ Sincronização manual concluída');
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      callbacks?.onError?.('Erro na sincronização manual');
    }
  }, [checkForDataUpdates, callbacks]);

  // Notificar mudança para outros dispositivos
  const notifyDataChange = useCallback(async () => {
    // Invalidar hash para forçar sincronização na próxima verificação
    lastDataHashRef.current = '';
    await checkForDataUpdates();
  }, [checkForDataUpdates]);

  // Setup inicial e listeners
  useEffect(() => {
    // Verificar status inicial
    const initialStatus = apiClient.getConnectionStatus();
    const newStatus: SyncStatus = {
      isOnline: initialStatus.isOnline,
      serverUrl: initialStatus.serverUrl,
      lastSync: null,
      connectedDevices: 1
    };
    
    setSyncStatus(newStatus);

    // Setup listeners
    window.addEventListener('api-connection-change', handleConnectionChange);

    // Inicializar sincronização se online
    if (initialStatus.isOnline) {
      initializeDataHash().then(() => {
        startPolling();
      });
    }

    return () => {
      window.removeEventListener('api-connection-change', handleConnectionChange);
      stopPolling();
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [handleConnectionChange, initializeDataHash, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [stopPolling]);

  return {
    syncStatus,
    isPolling,
    syncNow,
    notifyDataChange,
    startPolling,
    stopPolling
  };
}