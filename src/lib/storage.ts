// Sistema de armazenamento local para simular banco de dados
// Usa localStorage do navegador

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CPU {
  id: string;
  item: number;
  nomenclatura: string;
  tombamento: string;
  marca_modelo: string;
  processador: string;
  memoria_ram: string;
  hd: string | null;
  ssd: string | null;
  sistema_operacional: string;
  no_dominio: string;
  departamento: string;
  responsavel: string;
  e_estado: string;
  data_formatacao: string | null;
  desfazimento: string | null;
  created_at: string;
  updated_at: string;
}

export interface Monitor {
  id: string;
  item: number;
  tombamento: string;
  numero_serie: string;
  e_estado: string;
  modelo: string;
  polegadas: string;
  observacao: string | null;
  data_verificacao: string;
  responsavel: string;
  desfazimento: string | null;
  departamento: string;
  created_at: string;
  updated_at: string;
}

// Chaves do localStorage
const USERS_KEY = 'work_machine_users';
const CPUS_KEY = 'work_machine_cpus';
const MONITORS_KEY = 'work_machine_monitors';

// Função para gerar ID único
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para obter dados do localStorage
function getData<T>(key: string, defaultValue: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error);
    return defaultValue;
  }
}

// Função para salvar dados no localStorage
function setData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
}

// Inicializar dados padrão se não existirem
function initializeData(): void {
  const users = getData<User>(USERS_KEY, []);
  const cpus = getData<CPU>(CPUS_KEY, []);
  const monitors = getData<Monitor>(MONITORS_KEY, []);

  // Criar usuário admin padrão se não existir
  if (users.length === 0) {
    const adminUser: User = {
      id: generateId(),
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    users.push(adminUser);
    setData(USERS_KEY, users);
  }

  // CPUs serão adicionados pelo usuário - não criar dados de exemplo

  // Monitores serão adicionados pelo usuário - não criar dados de exemplo
}

// Função para limpar dados de exemplo (usar apenas se necessário)
export function clearSampleData(): void {
  // Limpa apenas se existirem dados que pareçam ser de exemplo
  const cpus = getAllCPUs();
  const monitors = getAllMonitors();
  
  // Remove CPUs de exemplo (identificadas por nomenclatura)
  const filteredCPUs = cpus.filter(cpu => 
    !cpu.nomenclatura.startsWith('CPU-0') && 
    !cpu.tombamento.startsWith('TMB0')
  );
  
  // Remove monitores de exemplo (identificados por tombamento)
  const filteredMonitors = monitors.filter(monitor => 
    !monitor.tombamento.startsWith('TMB0')
  );
  
  if (filteredCPUs.length !== cpus.length) {
    setData(CPUS_KEY, filteredCPUs);
  }
  
  if (filteredMonitors.length !== monitors.length) {
    setData(MONITORS_KEY, filteredMonitors);
  }
}

// Inicializar dados na primeira execução
initializeData();

// Funções para usuários
export function getAllUsers(): User[] {
  return getData<User>(USERS_KEY, []);
}

export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.id === id) || null;
}

export function getUserByUsername(username: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.username === username) || null;
}

export function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
  const users = getAllUsers();
  const newUser: User = {
    ...userData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  users.push(newUser);
  setData(USERS_KEY, users);
  return newUser;
}

// Funções para CPUs
export function getAllCPUs(): CPU[] {
  return getData<CPU>(CPUS_KEY, []);
}

export function getCPUById(id: string): CPU | null {
  const cpus = getAllCPUs();
  return cpus.find(cpu => cpu.id === id) || null;
}

export function createCPU(cpuData: Omit<CPU, 'id' | 'created_at' | 'updated_at'>): CPU {
  const cpus = getAllCPUs();
  const newCPU: CPU = {
    ...cpuData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  cpus.push(newCPU);
  setData(CPUS_KEY, cpus);
  return newCPU;
}

export function updateCPU(id: string, cpuData: Partial<Omit<CPU, 'id' | 'created_at'>>): CPU | null {
  const cpus = getAllCPUs();
  const index = cpus.findIndex(cpu => cpu.id === id);
  if (index === -1) return null;

  cpus[index] = {
    ...cpus[index],
    ...cpuData,
    updated_at: new Date().toISOString()
  };
  setData(CPUS_KEY, cpus);
  return cpus[index];
}

export function deleteCPU(id: string): boolean {
  const cpus = getAllCPUs();
  const filteredCPUs = cpus.filter(cpu => cpu.id !== id);
  if (filteredCPUs.length === cpus.length) return false;
  
  setData(CPUS_KEY, filteredCPUs);
  return true;
}

export function getCPUsByDepartment(department: string): CPU[] {
  const cpus = getAllCPUs();
  return cpus.filter(cpu => cpu.departamento === department);
}

export function getCPUsByState(state: string): CPU[] {
  const cpus = getAllCPUs();
  return cpus.filter(cpu => cpu.e_estado === state);
}

export function getCPUStats(): {
  total: number;
  byDepartment: Record<string, number>;
  byState: Record<string, number>;
} {
  const cpus = getAllCPUs();
  
  const byDepartment: Record<string, number> = {};
  const byState: Record<string, number> = {};
  
  cpus.forEach(cpu => {
    byDepartment[cpu.departamento] = (byDepartment[cpu.departamento] || 0) + 1;
    byState[cpu.e_estado] = (byState[cpu.e_estado] || 0) + 1;
  });

  return {
    total: cpus.length,
    byDepartment,
    byState
  };
}

// Funções para Monitores
export function getAllMonitors(): Monitor[] {
  return getData<Monitor>(MONITORS_KEY, []);
}

export function getMonitorById(id: string): Monitor | null {
  const monitors = getAllMonitors();
  return monitors.find(monitor => monitor.id === id) || null;
}

export function createMonitor(monitorData: Omit<Monitor, 'id' | 'created_at' | 'updated_at'>): Monitor {
  const monitors = getAllMonitors();
  const newMonitor: Monitor = {
    ...monitorData,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  monitors.push(newMonitor);
  setData(MONITORS_KEY, monitors);
  return newMonitor;
}

export function updateMonitor(id: string, monitorData: Partial<Omit<Monitor, 'id' | 'created_at'>>): Monitor | null {
  const monitors = getAllMonitors();
  const index = monitors.findIndex(monitor => monitor.id === id);
  if (index === -1) return null;

  monitors[index] = {
    ...monitors[index],
    ...monitorData,
    updated_at: new Date().toISOString()
  };
  setData(MONITORS_KEY, monitors);
  return monitors[index];
}

export function deleteMonitor(id: string): boolean {
  const monitors = getAllMonitors();
  const filteredMonitors = monitors.filter(monitor => monitor.id !== id);
  if (filteredMonitors.length === monitors.length) return false;
  
  setData(MONITORS_KEY, filteredMonitors);
  return true;
}

export function getMonitorsByDepartment(department: string): Monitor[] {
  const monitors = getAllMonitors();
  return monitors.filter(monitor => monitor.departamento === department);
}

export function getMonitorsByState(state: string): Monitor[] {
  const monitors = getAllMonitors();
  return monitors.filter(monitor => monitor.e_estado === state);
}

export function getMonitorStats(): {
  total: number;
  byDepartment: Record<string, number>;
  byState: Record<string, number>;
} {
  const monitors = getAllMonitors();
  
  const byDepartment: Record<string, number> = {};
  const byState: Record<string, number> = {};
  
  monitors.forEach(monitor => {
    byDepartment[monitor.departamento] = (byDepartment[monitor.departamento] || 0) + 1;
    byState[monitor.e_estado] = (byState[monitor.e_estado] || 0) + 1;
  });

  return {
    total: monitors.length,
    byDepartment,
    byState
  };
}
