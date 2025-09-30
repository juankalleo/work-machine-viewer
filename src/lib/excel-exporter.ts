import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { EquipmentData } from '@/types/equipment';

export function exportToExcel(data: EquipmentData, filename: string = 'equipamentos') {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create CPU worksheet
    if (data.cpus && data.cpus.length > 0) {
      const cpusForExport = data.cpus.map((cpu, index) => ({
        'Item': cpu.item || (index + 1),
        'Nomenclatura': cpu.nomenclatura || '',
        'Tombamento': cpu.tombamento || '',
        'E-estado': cpu.e_estado || '',
        'Marca/Modelo': cpu.marca_modelo || '',
        'Processador': cpu.processador || '',
        'Memória RAM': cpu.memoria_ram || '',
        'HD': cpu.hd || '',
        'SSD': cpu.ssd || '',
        'Sistema Operacional': cpu.sistema_operacional || '',
        'No Domínio': cpu.no_dominio || '',
        'Data Formatação': cpu.data_formatacao ? new Date(cpu.data_formatacao).toLocaleDateString('pt-BR') : '',
        'Responsável': cpu.responsavel || '',
        'Desfazimento': cpu.desfazimento || '',
        'Departamento': cpu.departamento || '',
        'Data Criação': cpu.created_at ? new Date(cpu.created_at).toLocaleDateString('pt-BR') : '',
        'Última Atualização': cpu.updated_at ? new Date(cpu.updated_at).toLocaleDateString('pt-BR') : ''
      }));

      const cpuWorksheet = XLSX.utils.json_to_sheet(cpusForExport);
      
      // Ajustar largura das colunas
      const columnWidths = [
        { wch: 8 },   // Item
        { wch: 20 },  // Nomenclatura
        { wch: 15 },  // Tombamento
        { wch: 12 },  // Estado
        { wch: 25 },  // Marca/Modelo
        { wch: 20 },  // Processador
        { wch: 12 },  // Memória RAM
        { wch: 15 },  // HD
        { wch: 15 },  // SSD
        { wch: 20 },  // Sistema Operacional
        { wch: 15 },  // No Domínio
        { wch: 15 },  // Data Formatação
        { wch: 20 },  // Responsável
        { wch: 15 },  // Desfazimento
        { wch: 15 },  // Departamento
        { wch: 15 },  // Data Criação
        { wch: 18 }   // Última Atualização
      ];
      
      cpuWorksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, cpuWorksheet, 'CPUs');
    }

    // Create Monitor worksheet (apenas se houver monitores)
    if (data.monitors && data.monitors.length > 0) {
      const monitorsForExport = data.monitors.map(monitor => ({
        'Item': monitor.item,
        'Tombamento': monitor.tombamento,
        'Número Série': monitor.numero_serie,
        'E-estado': monitor.e_estado,
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

    // Adicionar planilha de resumo
    const summaryData = [
      { 'Categoria': 'Total de CPUs', 'Quantidade': data.cpus?.length || 0 },
      { 'Categoria': 'CPUs Ativas', 'Quantidade': data.cpus?.filter(cpu => cpu.e_estado === 'Ativo').length || 0 },
      { 'Categoria': 'CPUs Inativas', 'Quantidade': data.cpus?.filter(cpu => cpu.e_estado === 'Inativo').length || 0 },
      { 'Categoria': 'Total de Monitores', 'Quantidade': data.monitors?.length || 0 },
      { 'Categoria': '', 'Quantidade': '' }, // Linha em branco
      { 'Categoria': 'Data da Exportação', 'Quantidade': new Date().toLocaleString('pt-BR') },
      { 'Categoria': 'Sistema', 'Quantidade': 'DER-SESUT Monitoramento' }
    ];
    
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');

    // Generate Excel file and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const timeString = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    saveAs(blob, `${filename}_${timestamp}_${timeString}.xlsx`);
    
    console.log('Excel exportado com sucesso!');
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error(`Erro ao exportar dados para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}