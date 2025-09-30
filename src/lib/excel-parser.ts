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
        
        console.log('📊 Arquivo Excel carregado. Planilhas encontradas:', workbook.SheetNames);
        
        // Parse each worksheet
        workbook.SheetNames.forEach((sheetName) => {
          console.log(`\n🔍 Processando planilha: "${sheetName}"`);
          const worksheet = workbook.Sheets[sheetName];
          
          // Sempre tentar o método de objeto primeiro (mais confiável para planilhas modernas)
          try {
            console.log('📋 Tentando parsing por objeto (com cabeçalhos)...');
            const objData = XLSX.utils.sheet_to_json(worksheet) as any[];
            console.log('✅ Parsing por objeto bem-sucedido. Linhas encontradas:', objData.length);
            
            if (objData.length > 0) {
              parseObjectData(objData, cpus, monitors, sheetName);
            }
          } catch (objError) {
            console.warn('❌ Erro no parsing por objeto:', objError);
            
            // Método fallback: JSON com header array
            try {
              console.log('📋 Tentando parsing com array de cabeçalhos...');
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
              console.log('✅ Parsing com array bem-sucedido. Linhas encontradas:', jsonData.length);
              
              parseCPUsFromSheet(jsonData, cpus, sheetName);
              parseMonitorsFromSheet(jsonData, monitors, sheetName);
            } catch (sheetError) {
              console.error('❌ Erro ao processar planilha', sheetName, ':', sheetError);
            }
          }
        });
        
        console.log('\n📈 Resultado final do parsing:');
        console.log('  ✅ CPUs encontradas:', cpus.length);
        console.log('  ✅ Monitores encontrados:', monitors.length);
        
        if (cpus.length > 0) {
          console.log('\n🖥️  Amostra das CPUs importadas:');
          cpus.slice(0, 3).forEach((cpu, i) => {
            console.log(`    ${i + 1}. ${cpu.nomenclatura || cpu.marca_modelo || cpu.processador || 'CPU sem nome'} (${cpu.departamento})`);
          });
        }
        
        resolve({ cpus, monitors });
      } catch (error) {
        console.error('❌ Erro geral no parsing:', error);
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
  console.log('Primeira linha de dados:', data[0]);
  console.log('Chaves da primeira linha:', data[0] ? Object.keys(data[0]) : 'Nenhuma');
  
  data.forEach((row, index) => {
    // Tentar detectar se é uma CPU baseado nos campos
    if (row && typeof row === 'object') {
      const keys = Object.keys(row);
      const keysLower = keys.map(k => k.toLowerCase());
      console.log(`Linha ${index}: chaves encontradas:`, keys);
      console.log(`Linha ${index}: valores:`, Object.values(row));
      
      // Expandir critérios de detecção - tornar mais flexível
      const isCPURow = (
        // Verificar se há pelo menos uma chave indicativa de CPU
        keysLower.some(k => 
          k.includes('cpu') || 
          k.includes('processador') || 
          k.includes('nomenclatura') || 
          k.includes('marca') ||
          k.includes('modelo') ||
          k.includes('tombamento') ||
          k.includes('tombo') ||
          k.includes('responsavel') ||
          k.includes('resp') ||
          k.includes('departamento') ||
          k.includes('depto') ||
          k.includes('item') ||
          k.includes('estado') ||
          k.includes('memoria') ||
          k.includes('ram') ||
          k.includes('hd') ||
          k.includes('ssd') ||
          k.includes('sistema') ||
          k.includes('dominio')
        ) ||
        // OU se há valores não vazios em campos típicos
        Object.values(row).some(value => {
          const str = String(value || '').toLowerCase();
          return str.includes('cpu') || 
                 str.includes('intel') || 
                 str.includes('amd') || 
                 str.includes('gb') ||
                 str.includes('windows') ||
                 str.includes('linux') ||
                 str.includes('ativo') ||
                 str.includes('inativo');
        })
      );
      
      console.log(`Linha ${index}: detectado como CPU?`, isCPURow);
      
      if (isCPURow) {
        // Mapear campos com busca mais flexível
        const getFieldValue = (possibleKeys: string[]) => {
          for (const possibleKey of possibleKeys) {
            // Busca exata
            if (row[possibleKey] !== undefined) {
              return row[possibleKey];
            }
            // Busca case-insensitive
            const foundKey = keys.find(k => k.toLowerCase() === possibleKey.toLowerCase());
            if (foundKey && row[foundKey] !== undefined) {
              return row[foundKey];
            }
            // Busca parcial
            const partialKey = keys.find(k => k.toLowerCase().includes(possibleKey.toLowerCase()));
            if (partialKey && row[partialKey] !== undefined) {
              return row[partialKey];
            }
          }
          return null;
        };
        
        const cpu: CPU = {
          id: `imported-${sheetName}-${index}-${Date.now()}-${Math.random()}`,
          item: parseNumber(getFieldValue(['Item', 'item', 'ITEM']) || index + 1),
          nomenclatura: parseString(getFieldValue(['Nomenclatura', 'nomenclatura', 'Nome', 'nome', 'NOMENCLATURA', 'NOME']) || ''),
          tombamento: parseString(getFieldValue(['Tombamento', 'tombamento', 'Tombo', 'tombo', 'TOMBAMENTO', 'TOMBO']) || ''),
          e_estado: parseString(getFieldValue(['E-estado', 'E Estado', 'Estado', 'estado', 'Status', 'status', 'ESTADO', 'STATUS']) || 'Ativo'),
          marca_modelo: parseString(getFieldValue(['Marca/Modelo', 'Marca_Modelo', 'Marca', 'marca', 'Modelo', 'modelo', 'MARCA', 'MODELO']) || ''),
          processador: parseString(getFieldValue(['Processador', 'processador', 'CPU', 'cpu', 'PROCESSADOR', 'Processor']) || ''),
          memoria_ram: parseString(getFieldValue(['Memória RAM', 'Memoria RAM', 'Memoria_RAM', 'RAM', 'ram', 'MEMORIA', 'Memoria', 'memoria']) || ''),
          hd: parseString(getFieldValue(['HD', 'hd', 'Hard Drive', 'hard_drive', 'Disco']) || '') || null,
          ssd: parseString(getFieldValue(['SSD', 'ssd', 'Solid State', 'solid_state']) || '') || null,
          sistema_operacional: parseString(getFieldValue(['Sistema Operacional', 'Sistema_Operacional', 'SO', 'so', 'Windows', 'windows', 'OS', 'os', 'SISTEMA']) || ''),
          no_dominio: parseString(getFieldValue(['No Domínio', 'No_Dominio', 'Dominio', 'dominio', 'Domain', 'DOMINIO']) || 'NÃO'),
          data_formatacao: parseString(getFieldValue(['Data Formatação', 'Data_Formatacao', 'DataFormatacao', 'Formatacao']) || '') || null,
          responsavel: parseString(getFieldValue(['Responsável', 'Responsavel', 'responsavel', 'Resp', 'resp', 'RESPONSAVEL']) || ''),
          desfazimento: parseString(getFieldValue(['Desfazimento', 'desfazimento', 'DESFAZIMENTO']) || '') || null,
          departamento: parseString(getFieldValue(['Departamento', 'departamento', 'Depto', 'depto', 'DEPARTAMENTO']) || sheetName || 'TI')
        };
        
        // Validação mais permissiva - pelo menos um campo principal deve ter valor
        const hasMinimalData = (
          (cpu.nomenclatura && cpu.nomenclatura.trim() !== '') || 
          (cpu.marca_modelo && cpu.marca_modelo.trim() !== '') || 
          (cpu.processador && cpu.processador.trim() !== '') ||
          (cpu.tombamento && cpu.tombamento.trim() !== '') ||
          (cpu.responsavel && cpu.responsavel.trim() !== '') ||
          (cpu.memoria_ram && cpu.memoria_ram.trim() !== '') ||
          (cpu.sistema_operacional && cpu.sistema_operacional.trim() !== '')
        );
        
        console.log('Dados extraídos da CPU:', {
          nomenclatura: cpu.nomenclatura,
          marca_modelo: cpu.marca_modelo,
          processador: cpu.processador,
          tombamento: cpu.tombamento,
          responsavel: cpu.responsavel,
          hasMinimalData: hasMinimalData
        });
        
        if (hasMinimalData) {
          cpus.push(cpu);
          console.log('✅ CPU adicionada:', cpu.nomenclatura || cpu.marca_modelo || cpu.processador || `CPU-${index}`);
        } else {
          console.log('❌ CPU ignorada - dados insuficientes:', {
            nomenclatura: cpu.nomenclatura,
            marca_modelo: cpu.marca_modelo,
            processador: cpu.processador,
            tombamento: cpu.tombamento,
            responsavel: cpu.responsavel,
            rawRow: row
          });
        }
      } else {
        console.log(`Linha ${index}: não detectado como CPU, ignorando`);
      }
    } else {
      console.log(`Linha ${index}: row inválido:`, typeof row, row);
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
      
      // Only add if it has meaningful data - more flexible validation
      const hasArrayData = (
        cpu.nomenclatura.trim() !== '' || 
        cpu.marca_modelo.trim() !== '' || 
        cpu.processador.trim() !== '' ||
        cpu.tombamento.trim() !== '' ||
        cpu.responsavel.trim() !== ''
      );
      
      if (hasArrayData) {
        cpus.push(cpu);
        console.log('CPU adicionada (array):', cpu.nomenclatura || cpu.marca_modelo || 'CPU sem nome');
      } else {
        console.log('CPU ignorada (array) - dados insuficientes');
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

// Dados limpos - sistema inicia vazio
export const sampleData: EquipmentData = {
  cpus: [],
  monitors: []
};
