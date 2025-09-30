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
          console.log('Processando planilha:', sheetName);
          const worksheet = workbook.Sheets[sheetName];
          
          // Tentar diferentes métodos de parsing
          try {
            // Método 1: JSON com header
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            parseCPUsFromSheet(jsonData, cpus, sheetName);
            parseMonitorsFromSheet(jsonData, monitors, sheetName);
          } catch (sheetError) {
            console.warn('Erro ao processar planilha', sheetName, ':', sheetError);
            
            // Método 2: Tentar parsing direto por objeto
            try {
              const objData = XLSX.utils.sheet_to_json(worksheet) as any[];
              parseObjectData(objData, cpus, monitors, sheetName);
            } catch (objError) {
              console.warn('Erro no parsing por objeto:', objError);
            }
          }
        });
        
        console.log('CPUs encontradas:', cpus.length);
        console.log('Monitores encontrados:', monitors.length);
        
        resolve({ cpus, monitors });
      } catch (error) {
        console.error('Erro geral no parsing:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    reader.readAsBinaryString(file);
  });
}

// Nova função para parsing por objeto (quando a planilha tem cabeçalhos)
function parseObjectData(data: any[], cpus: CPU[], monitors: Monitor[], sheetName: string) {
  console.log('Parsing por objeto, dados encontrados:', data.length);
  
  data.forEach((row, index) => {
    // Tentar detectar se é uma CPU baseado nos campos
    if (row && typeof row === 'object') {
      const keys = Object.keys(row).map(k => k.toLowerCase());
      
      // Procurar por campos típicos de CPU
      if (keys.some(k => k.includes('cpu') || k.includes('processador') || k.includes('nomenclatura') || k.includes('marca'))) {
        const cpu: CPU = {
          id: `imported-${sheetName}-${index}-${Date.now()}-${Math.random()}`,
          item: parseNumber(row.Item || row.item || index + 1),
          nomenclatura: parseString(row.Nomenclatura || row.nomenclatura || row.Nome || row.nome || ''),
          tombamento: parseString(row.Tombamento || row.tombamento || row.Tombo || row.tombo || ''),
          e_estado: parseString(row['E-estado'] || row['E Estado'] || row.Estado || row.estado || row.Status || row.status || ''),
          marca_modelo: parseString(row['Marca/Modelo'] || row.Marca || row.marca || row.Modelo || row.modelo || ''),
          processador: parseString(row.Processador || row.processador || row.CPU || row.cpu || ''),
          memoria_ram: parseString(row['Memória RAM'] || row['Memoria RAM'] || row['RAM'] || row.ram || ''),
          hd: parseString(row.HD || row.hd || '') || null,
          ssd: parseString(row.SSD || row.ssd || '') || null,
          sistema_operacional: parseString(row['Sistema Operacional'] || row.SO || row.so || row.Windows || ''),
          no_dominio: parseString(row['No Domínio'] || row.Dominio || row.dominio || 'SIM'),
          data_formatacao: parseString(row['Data Formatação'] || row['Data Formatacao'] || '') || null,
          responsavel: parseString(row.Responsável || row.responsavel || row.Resp || ''),
          desfazimento: parseString(row.Desfazimento || row.desfazimento || '') || null,
          departamento: parseString(row.Departamento || row.departamento || row.Depto || sheetName || 'TI')
        };
        
        // Só adicionar se tiver dados mínimos
        if (cpu.nomenclatura || cpu.marca_modelo || cpu.processador) {
          cpus.push(cpu);
          console.log('CPU adicionada:', cpu.nomenclatura);
        }
      }
    }
  });
}

// Funções auxiliares para parsing
function parseString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function parseNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function parseCPUsFromSheet(data: any[][], cpus: CPU[], sheetName?: string) {
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

function parseMonitorsFromSheet(data: any[][], monitors: Monitor[], sheetName?: string) {
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
      e_estado: '210000512',
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
      e_estado: '210000509',
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