// Sistema de dados local para o navegador
import { 
  CPU, Monitor, User, 
  getAllCPUs, getAllMonitors, getAllUsers, 
  createCPU as storageCPU, createMonitor as storageMonitor, createUser as storageUser, 
  updateCPU as storageUpdateCPU, updateMonitor as storageUpdateMonitor,
  deleteCPU as storageDeleteCPU, deleteMonitor as storageDeleteMonitor,
  getUserByUsername
} from './storage';

class DatabaseManager {
  private static instance: DatabaseManager;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // CPUs
  async getAllCPUs(): Promise<CPU[]> {
    return getAllCPUs();
  }

  async createCPU(cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<CPU> {
    return storageCPU(cpuData);
  }

  async updateCPU(id: string, cpuData: Partial<CPU>): Promise<CPU | null> {
    return storageUpdateCPU(id, cpuData);
  }

  async deleteCPU(id: string): Promise<boolean> {
    return storageDeleteCPU(id);
  }

  // Monitores
  async getAllMonitors(): Promise<Monitor[]> {
    return getAllMonitors();
  }

  async createMonitor(monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>): Promise<Monitor> {
    return storageMonitor(monitorData);
  }

  async updateMonitor(id: string, monitorData: Partial<Monitor>): Promise<Monitor | null> {
    return storageUpdateMonitor(id, monitorData);
  }

  async deleteMonitor(id: string): Promise<boolean> {
    return storageDeleteMonitor(id);
  }

  // Usuários
  async getAllUsers(): Promise<User[]> {
    return getAllUsers();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return getUserByUsername(username);
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return storageUser(userData);
  }

  // Utilitários
  async testConnection(): Promise<boolean> {
    return true;
  }

  isReady(): boolean {
    return true;
  }

  async syncNow(): Promise<void> {
    return Promise.resolve();
  }

  getConnectionStatus(): { isOnline: boolean; serverUrl: string } {
    return {
      isOnline: true,
      serverUrl: 'localStorage'
    };
  }
}

export const db = DatabaseManager.getInstance();
export default db;