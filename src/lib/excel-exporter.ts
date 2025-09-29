import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { EquipmentData } from '@/types/equipment';

export function exportToExcel(data: EquipmentData, filename: string = 'equipamentos') {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create CPU worksheet
    if (data.cpus.length > 0) {
      const cpusForExport = data.cpus.map(cpu => ({
        'Item': cpu.item,
        'Nomenclatura': cpu.nomenclatura,
        'Tombamento': cpu.tombamento,
        'Estado': cpu.e_estado,
        'Marca/Modelo': cpu.marca_modelo,
        'Processador': cpu.processador,
        'Memória RAM': cpu.memoria_ram,
        'HD': cpu.hd || '',
        'SSD': cpu.ssd || '',
        'Sistema Operacional': cpu.sistema_operacional,
        'No Domínio': cpu.no_dominio,
        'Data Formatação': cpu.data_formatacao || '',
        'Responsável': cpu.responsavel,
        'Desfazimento': cpu.desfazimento || '',
        'Departamento': cpu.departamento
      }));

      const cpuWorksheet = XLSX.utils.json_to_sheet(cpusForExport);
      XLSX.utils.book_append_sheet(workbook, cpuWorksheet, 'CPUs');
    }

    // Create Monitor worksheet
    if (data.monitors.length > 0) {
      const monitorsForExport = data.monitors.map(monitor => ({
        'Item': monitor.item,
        'Tombamento': monitor.tombamento,
        'Número Série': monitor.numero_serie,
        'Estado': monitor.e_estado,
        'Modelo': monitor.modelo,
        'Polegadas': monitor.polegadas,
        'Observação': monitor.observacao || '',
        'Data Verificação': monitor.data_verificacao,
        'Responsável': monitor.responsavel,
        'Desfazimento': monitor.desfazimento || '',
        'Departamento': monitor.departamento
      }));

      const monitorWorksheet = XLSX.utils.json_to_sheet(monitorsForExport);
      XLSX.utils.book_append_sheet(workbook, monitorWorksheet, 'Monitores');
    }

    // Generate Excel file and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `${filename}_${timestamp}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Erro ao exportar dados para Excel');
  }
}