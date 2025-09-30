// Cliente API para integração multi-dispositivo
// Conecta com o backend PostgreSQL e permite cache local

import { CPU, Monitor, User } from './storage';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  private isOnline: boolean = false;
  private cache: Map<string, any> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  // Configurações padrão para descoberta automática
  private possibleServers = [
    'http://localhost:3001',
    'http://10.46.0.213:3001',
    'http://192.168.1.100:3001', // Adicione outros IPs conforme necessário
  ];

  private constructor() {
    this.baseUrl = this.getStoredServerUrl() || '';
    this.discoverServer();
    this.startSyncMonitoring();
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getStoredServerUrl(): string | null {
    return localStorage.getItem('work_machine_server_url');
  }

  private setStoredServerUrl(url: string): void {
    localStorage.setItem('work_machine_server_url', url);
    this.baseUrl = url;
  }

  // Descoberta automática do servidor
  private async discoverServer(): Promise<void> {
    console.log('🔍 Procurando servidor backend...');
    
    for (const serverUrl of this.possibleServers) {
      try {
        const response = await fetch(`${serverUrl}/api/health`, {
          method: 'GET',
          timeout: 3000,
        } as any);
        
        if (response.ok) {
          console.log(`✅ Servidor encontrado em: ${serverUrl}`);
          this.setStoredServerUrl(serverUrl);
          this.isOnline = true;
          this.notifyConnectionChange();
          return;
        }
      } catch (error) {
        console.log(`❌ Servidor não encontrado em: ${serverUrl}`);
      }
    }

    console.log('⚠️ Nenhum servidor encontrado. Trabalhando offline.');
    this.isOnline = false;
    this.notifyConnectionChange();
  }

  // Monitoramento contínuo da conexão
  private startSyncMonitoring(): void {
    this.syncInterval = setInterval(async () => {
      await this.checkServerHealth();
    }, 30000); // Check a cada 30 segundos
  }

  private async checkServerHealth(): Promise<void> {
    if (!this.baseUrl) {
      await this.discoverServer();
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        timeout: 5000,
      } as any);
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      if (wasOnline !== this.isOnline) {
        this.notifyConnectionChange();
      }
    } catch (error) {
      if (this.isOnline) {
        this.isOnline = false;
        this.notifyConnectionChange();
      }
    }
  }

  private notifyConnectionChange(): void {
    // Dispatch evento customizado para componentes React
    window.dispatchEvent(new CustomEvent('api-connection-change', {
      detail: { isOnline: this.isOnline, baseUrl: this.baseUrl }
    }));
  }

  // Método genérico para chamadas da API
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (!this.isOnline || !this.baseUrl) {
      return this.getFromCache<T>(endpoint) || { success: false, error: 'Servidor offline' };
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache da resposta para uso offline
      if (options.method === 'GET' || !options.method) {
        this.cache.set(endpoint, { success: true, data });
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Tentar usar cache se disponível
      const cached = this.getFromCache<T>(endpoint);
      if (cached) {
        console.log(`📱 Usando dados em cache para: ${endpoint}`);
        return cached;
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  private getFromCache<T>(endpoint: string): ApiResponse<T> | null {
    const cached = this.cache.get(endpoint);
    return cached || null;
  }

  // === MÉTODOS PARA CPUs ===

  async getAllCPUs(): Promise<CPU[]> {
    const response = await this.apiCall<CPU[]>('/api/cpus');
    return response.data || [];
  }

  async createCPU(cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<CPU | null> {
    const response = await this.apiCall<CPU>('/api/cpus', {
      method: 'POST',
      body: JSON.stringify(cpuData),
    });
    
    if (response.success && response.data) {
      // Invalidar cache para forçar reload
      this.cache.delete('/api/cpus');
      return response.data;
    }
    
    return null;
  }

  async updateCPU(id: string, cpuData: Partial<CPU>): Promise<CPU | null> {
    const response = await this.apiCall<CPU>(`/api/cpus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cpuData),
    });
    
    if (response.success && response.data) {
      this.cache.delete('/api/cpus');
      return response.data;
    }
    
    return null;
  }

  async deleteCPU(id: string): Promise<boolean> {
    const response = await this.apiCall<any>(`/api/cpus/${id}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      this.cache.delete('/api/cpus');
      return true;
    }
    
    return false;
  }

  // === MÉTODOS PARA MONITORES ===

  async getAllMonitors(): Promise<Monitor[]> {
    const response = await this.apiCall<Monitor[]>('/api/monitors');
    return response.data || [];
  }

  async createMonitor(monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>): Promise<Monitor | null> {
    const response = await this.apiCall<Monitor>('/api/monitors', {
      method: 'POST',
      body: JSON.stringify(monitorData),
    });
    
    if (response.success && response.data) {
      this.cache.delete('/api/monitors');
      return response.data;
    }
    
    return null;
  }

  async updateMonitor(id: string, monitorData: Partial<Monitor>): Promise<Monitor | null> {
    const response = await this.apiCall<Monitor>(`/api/monitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(monitorData),
    });
    
    if (response.success && response.data) {
      this.cache.delete('/api/monitors');
      return response.data;
    }
    
    return null;
  }

  async deleteMonitor(id: string): Promise<boolean> {
    const response = await this.apiCall<any>(`/api/monitors/${id}`, {
      method: 'DELETE',
    });
    
    if (response.success) {
      this.cache.delete('/api/monitors');
      return true;
    }
    
    return false;
  }

  // === MÉTODOS PARA USUÁRIOS ===

  async getAllUsers(): Promise<User[]> {
    const response = await this.apiCall<User[]>('/api/users');
    return response.data || [];
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const response = await this.apiCall<User>(`/api/users/${username}`);
    return response.data || null;
  }

  // === MÉTODOS UTILITÁRIOS ===

  async getStats(): Promise<any> {
    const response = await this.apiCall<any>('/api/stats');
    return response.data || {
      totalCPUs: 0,
      activeCPUs: 0,
      totalMonitors: 0,
      activeMonitors: 0,
      byDepartment: {}
    };
  }

  // Configuração manual do servidor
  async setServerUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/health`);
      if (response.ok) {
        this.setStoredServerUrl(url);
        this.isOnline = true;
        this.notifyConnectionChange();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Status da conexão
  getConnectionStatus(): { isOnline: boolean; serverUrl: string } {
    return {
      isOnline: this.isOnline,
      serverUrl: this.baseUrl
    };
  }

  // Sincronização manual
  async syncNow(): Promise<void> {
    this.cache.clear();
    await this.checkServerHealth();
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const apiClient = ApiClient.getInstance();
export default apiClient;