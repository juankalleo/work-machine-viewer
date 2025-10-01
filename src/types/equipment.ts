export interface CPU {
  id: string;
  item: number;
  nomenclatura: string;
  tombamento: string;
  e_estado: number;
  marca_modelo: string;
  processador: string;
  memoria_ram: string;
  hd: string | null;
  ssd: string | null;
  sistema_operacional: string;
  no_dominio: string;
  data_formatacao: string | null;
  responsavel: string;
  desfazimento: string | null;
  departamento: string;
  created_at?: string;
  updated_at?: string;
}

export interface Monitor {
  id: string;
  item: number;
  tombamento: string;
  numero_serie: string;
  e_estado: number;
  modelo: string;
  polegadas: string;
  observacao?: string | null;
  data_verificacao: string;
  responsavel: string;
  desfazimento: string | null;
  departamento: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentData {
  cpus: CPU[];
  monitors: Monitor[];
}

export interface DepartmentStats {
  name: string;
  totalCPUs: number;
  totalMonitors: number;
  cpusAtivos: number;
  monitoresAtivos: number;
  formatacoes: number;
}

export interface ProcessorStats {
  name: string;
  count: number;
  percentage: number;
}

export interface OperatingSystemStats {
  name: string;
  count: number;
  percentage: number;
}

export interface ResponsibleStats {
  name: string;
  equipmentCount: number;
  lastActivity: string;
}