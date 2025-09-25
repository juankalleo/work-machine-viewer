import * as XLSX from 'xlsx';
import { CPU, Monitor, EquipmentData } from '@/types/equipment';

export function parseExcelFile(file: File): Promise<EquipmentData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const cpus: CPU[] = [];
        const monitors: Monitor[] = [];
        
        // Parse each worksheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          parseCPUsFromSheet(jsonData, cpus);
          parseMonitorsFromSheet(jsonData, monitors);
        });
        
        resolve({ cpus, monitors });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsBinaryString(file);
  });
}

function parseCPUsFromSheet(data: any[][], cpus: CPU[]) {
  let currentDepartment = '';
  let inCPUSection = false;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').toUpperCase();
    
    // Detect department from headers like "CPU'S - DER-GTI"
    if (firstCell.includes("CPU'S - DER-")) {
      currentDepartment = firstCell.split('CPU\'S - ')[1] || '';
      inCPUSection = true;
      continue;
    }
    
    // Check if we hit monitors section
    if (firstCell.includes('MONITORES')) {
      inCPUSection = false;
      continue;
    }
    
    // Skip header rows
    if (firstCell === 'ITEM' || firstCell === 'TOTAL DE MÁQUINAS:') {
      continue;
    }
    
    // Parse CPU data rows
    if (inCPUSection && currentDepartment && row[0] && !isNaN(Number(row[0]))) {
      const cpu: CPU = {
        id: `${currentDepartment}-${row[0]}-${Date.now()}-${Math.random()}`,
        item: Number(row[0]) || 0,
        nomenclatura: String(row[1] || ''),
        tombamento: String(row[2] || ''),
        e_estado: String(row[3] || ''),
        marca_modelo: String(row[4] || ''),
        processador: String(row[5] || ''),
        memoria_ram: String(row[6] || ''),
        hd: String(row[7] || '') || null,
        ssd: String(row[8] || '') || null,
        sistema_operacional: String(row[9] || ''),
        no_dominio: String(row[10] || ''),
        data_formatacao: String(row[11] || '') || null,
        responsavel: String(row[12] || ''),
        desfazimento: String(row[13] || '') || null,
        departamento: currentDepartment
      };
      
      // Only add if it has meaningful data
      if (cpu.nomenclatura || cpu.marca_modelo) {
        cpus.push(cpu);
      }
    }
  }
}

function parseMonitorsFromSheet(data: any[][], monitors: Monitor[]) {
  let currentDepartment = '';
  let inMonitorSection = false;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').toUpperCase();
    
    // Detect department and monitor section
    if (firstCell.includes('MONITORES - DER-')) {
      currentDepartment = firstCell.split('MONITORES - ')[1] || '';
      inMonitorSection = true;
      continue;
    }
    
    // Check if we exit monitor section
    if (firstCell.includes("CPU'S - DER-") || firstCell.includes('TOTAL DE MONITORES:')) {
      inMonitorSection = false;
      continue;
    }
    
    // Skip header rows
    if (firstCell === 'ITEM') {
      continue;
    }
    
    // Parse monitor data rows
    if (inMonitorSection && currentDepartment && row[0] && !isNaN(Number(row[0]))) {
      const monitor: Monitor = {
        id: `monitor-${currentDepartment}-${row[0]}-${Date.now()}-${Math.random()}`,
        item: Number(row[0]) || 0,
        tombamento: String(row[1] || ''),
        numero_serie: String(row[2] || ''),
        e_estado: String(row[3] || ''),
        modelo: String(row[4] || ''),
        polegadas: String(row[5] || ''),
        observacao: String(row[6] || '') || null,
        data_verificacao: String(row[11] || ''),
        responsavel: String(row[12] || ''),
        desfazimento: String(row[13] || '') || null,
        departamento: currentDepartment
      };
      
      // Only add if it has meaningful data
      if (monitor.modelo || monitor.tombamento) {
        monitors.push(monitor);
      }
    }
  }
}

// Sample data for testing
export const sampleData: EquipmentData = {
  cpus: [
    {
      id: '1',
      item: 1,
      nomenclatura: 'DER-GTI018',
      tombamento: '12018',
      e_estado: 'RASURADO',
      marca_modelo: 'DELL OptiPlex 7040',
      processador: 'Intel Core I5-6500',
      memoria_ram: '20GB',
      hd: '1TB',
      ssd: null,
      sistema_operacional: 'Windows 11 PRO',
      no_dominio: 'SIM',
      data_formatacao: '23/09/2025',
      responsavel: 'JUAN KALLEO',
      desfazimento: null,
      departamento: 'DER-GTI'
    }
  ],
  monitors: [
    {
      id: '1',
      item: 1,
      tombamento: '',
      numero_serie: 'BR-OMNV2T-TVBOO-OA9-2L9B-AO9',
      e_estado: '210,000,509',
      modelo: 'DELL P2319Hc',
      polegadas: '23',
      observacao: null,
      data_verificacao: '24/09/2025',
      responsavel: 'Diego Charles',
      desfazimento: null,
      departamento: 'DER-GTI'
    }
  ]
};