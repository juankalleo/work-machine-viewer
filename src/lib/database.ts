// Sistema de banco de dados MySQL direto
// Conecta diretamente com o banco MySQL

import mysql from 'mysql2/promise';
import { CPU, Monitor, User } from './storage';

// Configuração da conexão MySQL
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || process.env.DB_PORT || '3306'),
  user: import.meta.env.VITE_DB_USER || process.env.DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_NAME || process.env.DB_NAME || 'work_machine_viewer',
  charset: 'utf8mb4',
  timezone: '+00:00'
};

// Classe para gerenciar dados com MySQL
class DatabaseManager {
  private static instance: DatabaseManager;
  private connection: mysql.Connection | null = null;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async getConnection(): Promise<mysql.Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection(dbConfig);
    }
    return this.connection;
  }

  // === MÉTODOS PARA CPUs ===
  async getAllCPUs(): Promise<CPU[]> {
    try {
      const conn = await this.getConnection();
      const [rows] = await conn.execute('SELECT * FROM cpus ORDER BY created_at DESC');
      return rows as CPU[];
    } catch (error) {
      console.error('Erro ao buscar CPUs:', error);
      return [];
    }
  }

  async createCPU(cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): Promise<CPU> {
    try {
      const conn = await this.getConnection();
      const id = crypto.randomUUID();
      
      const query = `
        INSERT INTO cpus (
          id, item, nomenclatura, tombamento, marca_modelo, processador, 
          memoria_ram, hd, ssd, sistema_operacional, no_dominio, 
          departamento, responsavel, e_estado, data_formatacao, desfazimento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        id, cpuData.item, cpuData.nomenclatura, cpuData.tombamento,
        cpuData.marca_modelo, cpuData.processador, cpuData.memoria_ram,
        cpuData.hd, cpuData.ssd, cpuData.sistema_operacional,
        cpuData.no_dominio, cpuData.departamento, cpuData.responsavel,
        cpuData.e_estado, cpuData.data_formatacao, cpuData.desfazimento
      ];
      
      await conn.execute(query, values);
      
      const [rows] = await conn.execute('SELECT * FROM cpus WHERE id = ?', [id]);
      return (rows as CPU[])[0];
    } catch (error) {
      console.error('Erro ao criar CPU:', error);
      throw error;
    }
  }

  async updateCPU(id: string, cpuData: Partial<CPU>): Promise<CPU | null> {
    try {
      const conn = await this.getConnection();
      const fields = Object.keys(cpuData).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
      const values = fields.map(field => cpuData[field as keyof CPU]);
      
      if (fields.length === 0) return null;
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE cpus SET ${setClause} WHERE id = ?`;
      
      await conn.execute(query, [...values, id]);
      
      const [rows] = await conn.execute('SELECT * FROM cpus WHERE id = ?', [id]);
      return (rows as CPU[])[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar CPU:', error);
      return null;
    }
  }

  async deleteCPU(id: string): Promise<boolean> {
    try {
      const conn = await this.getConnection();
      const [result] = await conn.execute('DELETE FROM cpus WHERE id = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar CPU:', error);
      return false;
    }
  }

  // === MÉTODOS PARA MONITORES ===
  async getAllMonitors(): Promise<Monitor[]> {
    try {
      const conn = await this.getConnection();
      const [rows] = await conn.execute('SELECT * FROM monitors ORDER BY created_at DESC');
      return rows as Monitor[];
    } catch (error) {
      console.error('Erro ao buscar monitores:', error);
      return [];
    }
  }

  async createMonitor(monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>): Promise<Monitor> {
    try {
      const conn = await this.getConnection();
      const id = crypto.randomUUID();
      
      const query = `
        INSERT INTO monitors (
          id, item, tombamento, numero_serie, modelo, polegadas,
          observacao, data_verificacao, responsavel, e_estado,
          departamento, desfazimento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        id, monitorData.item, monitorData.tombamento, monitorData.numero_serie,
        monitorData.modelo, monitorData.polegadas, monitorData.observacao,
        monitorData.data_verificacao, monitorData.responsavel, monitorData.e_estado,
        monitorData.departamento, monitorData.desfazimento
      ];
      
      await conn.execute(query, values);
      
      const [rows] = await conn.execute('SELECT * FROM monitors WHERE id = ?', [id]);
      return (rows as Monitor[])[0];
    } catch (error) {
      console.error('Erro ao criar monitor:', error);
      throw error;
    }
  }

  async updateMonitor(id: string, monitorData: Partial<Monitor>): Promise<Monitor | null> {
    try {
      const conn = await this.getConnection();
      const fields = Object.keys(monitorData).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
      const values = fields.map(field => monitorData[field as keyof Monitor]);
      
      if (fields.length === 0) return null;
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE monitors SET ${setClause} WHERE id = ?`;
      
      await conn.execute(query, [...values, id]);
      
      const [rows] = await conn.execute('SELECT * FROM monitors WHERE id = ?', [id]);
      return (rows as Monitor[])[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar monitor:', error);
      return null;
    }
  }

  async deleteMonitor(id: string): Promise<boolean> {
    try {
      const conn = await this.getConnection();
      const [result] = await conn.execute('DELETE FROM monitors WHERE id = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar monitor:', error);
      return false;
    }
  }

  // === MÉTODOS PARA USUÁRIOS ===
  async getAllUsers(): Promise<User[]> {
    try {
      const conn = await this.getConnection();
      const [rows] = await conn.execute('SELECT * FROM users ORDER BY created_at DESC');
      return rows as User[];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const conn = await this.getConnection();
      const [rows] = await conn.execute('SELECT * FROM users WHERE username = ?', [username]);
      const users = rows as User[];
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      const conn = await this.getConnection();
      const id = crypto.randomUUID();
      
      const query = `
        INSERT INTO users (id, username, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [id, userData.username, userData.email, userData.password_hash, userData.role];
      await conn.execute(query, values);
      
      const [rows] = await conn.execute('SELECT * FROM users WHERE id = ?', [id]);
      return (rows as User[])[0];
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // === MÉTODOS UTILITÁRIOS ===
  async testConnection(): Promise<boolean> {
    try {
      const conn = await this.getConnection();
      await conn.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.connection !== null;
  }

  // Fechar conexão
  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  // Status da conexão
  getConnectionStatus(): { isOnline: boolean; serverUrl: string } {
    return {
      isOnline: this.connection !== null,
      serverUrl: `mysql://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    };
  }
}

export const db = DatabaseManager.getInstance();
export default db;