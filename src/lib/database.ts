// Sistema de banco de dados integrado multi-dispositivo
// Conecta com o backend PostgreSQL via API REST

import { CPU, Monitor, User } from './storage';
import { apiClient } from './api-client';

// Classe para gerenciar dados compartilhados entre dispositivos
class DatabaseManager {
  private static instance: DatabaseManager;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // === MÉTODOS PARA CPUs ===
  async getAllCPUs(): Promise<CPU[]> {
    try {
      return await apiClient.getAllCPUs();
    } catch (error) {
      console.error('Erro ao buscar CPUs:', error);
      return [];
    }
  }

  async createCPU(cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<CPU> {
    try {
      const result = await apiClient.createCPU(cpuData);
      if (!result) {
        throw new Error('Falha ao criar CPU');
      }
      return result;
    } catch (error) {
      console.error('Erro ao criar CPU:', error);
      throw error;
    }
  }

  async updateCPU(id: string, cpuData: Partial<CPU>): Promise<CPU | null> {
    try {
      return await apiClient.updateCPU(id, cpuData);
    } catch (error) {
      console.error('Erro ao atualizar CPU:', error);
      return null;
    }
  }

  async deleteCPU(id: string): Promise<boolean> {
    try {
      return await apiClient.deleteCPU(id);
    } catch (error) {
      console.error('Erro ao deletar CPU:', error);
      return false;
    }
  }

  // === MÉTODOS PARA MONITORES ===
  async getAllMonitors(): Promise<Monitor[]> {
    try {
      return await apiClient.getAllMonitors();
    } catch (error) {
      console.error('Erro ao buscar monitores:', error);
      return [];
    }
  }

  async createMonitor(monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>): Promise<Monitor> {
    try {
      const result = await apiClient.createMonitor(monitorData);
      if (!result) {
        throw new Error('Falha ao criar monitor');
      }
      return result;
    } catch (error) {
      console.error('Erro ao criar monitor:', error);
      throw error;
    }
  }

  async updateMonitor(id: string, monitorData: Partial<Monitor>): Promise<Monitor | null> {
    try {
      return await apiClient.updateMonitor(id, monitorData);
    } catch (error) {
      console.error('Erro ao atualizar monitor:', error);
      return null;
    }
  }

  async deleteMonitor(id: string): Promise<boolean> {
    try {
      return await apiClient.deleteMonitor(id);
    } catch (error) {
      console.error('Erro ao deletar monitor:', error);
      return false;
    }
  }

  // === MÉTODOS PARA USUÁRIOS ===
  async getAllUsers(): Promise<User[]> {
    try {
      return await apiClient.getAllUsers();
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await apiClient.getUserByUsername(username);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  // === MÉTODOS UTILITÁRIOS ===
  async testConnection(): Promise<boolean> {
    try {
      const status = apiClient.getConnectionStatus();
      return status.isOnline;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  isReady(): boolean {
    const status = apiClient.getConnectionStatus();
    return status.isOnline;
  }

  // Sincronização manual
  async syncNow(): Promise<void> {
    await apiClient.syncNow();
  }

  // Status da conexão
  getConnectionStatus(): { isOnline: boolean; serverUrl: string } {
    return apiClient.getConnectionStatus();
  }
}

export const db = DatabaseManager.getInstance();
export default db;