export interface CPU {
  id: string;
  item: number;
  nomenclatura: string;
  tombamento: string;
  eEstado: string;
  marcaModelo: string;
  processador: string;
  memoriaRam: string;
  hd: string;
  ssd: string;
  sistemaOperacional: string;
  noDominio: string;
  dataFormatacao: string;
  responsavel: string;
  desfazimento: string;
  departamento: string;
}

export interface Monitor {
  id: string;
  item: number;
  tombamento: string;
  numeroSerie: string;
  eEstado: string;
  modelo: string;
  polegadas: string;
  observacao?: string;
  dataVerificacao: string;
  responsavel: string;
  desfazimento: string;
  departamento: string;
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