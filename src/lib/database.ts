// Sistema de dados MySQL para o navegador
import { CPU, Monitor, User } from '@/types/equipment';

// Configuração do servidor MySQL
const API_BASE_URL = 'http://193.203.175.32:3001/api';

class DatabaseManager {
  private static instance: DatabaseManager;
  private baseUrl = API_BASE_URL;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Database request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // CPUs
  async getAllCPUs(): Promise<CPU[]> {
    return await this.request('/cpus');
  }

  async createCPU(cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<CPU> {
    return await this.request('/cpus', {
      method: 'POST',
      body: JSON.stringify(cpuData),
    });
  }

  async updateCPU(id: string, cpuData: Partial<CPU>): Promise<CPU | null> {
    return await this.request(`/cpus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cpuData),
    });
  }

  async deleteCPU(id: string): Promise<boolean> {
    try {
      await this.request(`/cpus/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar CPU:', error);
      return false;
    }
  }

  // Monitores
  async getAllMonitors(): Promise<Monitor[]> {
    return await this.request('/monitors');
  }

  async createMonitor(monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>): Promise<Monitor> {
    return await this.request('/monitors', {
      method: 'POST',
      body: JSON.stringify(monitorData),
    });
  }

  async updateMonitor(id: string, monitorData: Partial<Monitor>): Promise<Monitor | null> {
    return await this.request(`/monitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(monitorData),
    });
  }

  async deleteMonitor(id: string): Promise<boolean> {
    try {
      await this.request(`/monitors/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Erro ao deletar Monitor:', error);
      return false;
    }
  }

  // Usuários
  async getAllUsers(): Promise<User[]> {
    return await this.request('/users');
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.request(`/users/${username}`);
    } catch (error) {
      console.error('Usuário não encontrado:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Utilitários
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch (error) {
      console.error('Conexão com servidor falhou:', error);
      return false;
    }
  }

  isReady(): boolean {
    return true; // MySQL é sempre "ready" (conexão é estabelecida no servidor)
  }

  async syncNow(): Promise<void> {
    // Para MySQL, sincronização é automática
    return Promise.resolve();
  }

  getConnectionStatus(): { isOnline: boolean; serverUrl: string } {
    return {
      isOnline: true,
      serverUrl: this.baseUrl
    };
  }

  // Estatísticas
  async getStats(): Promise<any> {
    return await this.request('/stats');
  }
}

export const db = DatabaseManager.getInstance();
export default db;