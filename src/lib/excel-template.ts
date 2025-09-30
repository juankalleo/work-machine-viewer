import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function downloadExcelTemplate() {
  try {
    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Dados de exemplo para template de CPUs
    const cpuTemplate = [
      {
        'Item': 1,
        'Nomenclatura': 'DER-GTI001',
        'Tombamento': '12345',
        'E-estado': '210000509',
        'Marca/Modelo': 'Dell OptiPlex 7090',
        'Processador': 'Intel Core i5-11500',
        'Memória RAM': '8GB DDR4',
        'HD': '1TB SATA',
        'SSD': '',
        'Sistema Operacional': 'Windows 11 Pro',
        'No Domínio': 'SIM',
        'Data Formatação': '2025-01-15',
        'Responsável': 'João Silva',
        'Desfazimento': '',
        'Departamento': 'TI'
      },
      {
        'Item': 2,
        'Nomenclatura': 'DER-GTI002',
        'Tombamento': '12346',
        'E-estado': '210000510',
        'Marca/Modelo': 'HP EliteDesk 800 G8',
        'Processador': 'Intel Core i7-11700',
        'Memória RAM': '16GB DDR4',
        'HD': '',
        'SSD': '512GB NVMe',
        'Sistema Operacional': 'Windows 11 Pro',
        'No Domínio': 'SIM',
        'Data Formatação': '',
        'Responsável': 'Maria Santos',
        'Desfazimento': '',
        'Departamento': 'Administração'
      }
    ];

    // Criar planilha de CPUs
    const cpuWorksheet = XLSX.utils.json_to_sheet(cpuTemplate);
    
    // Configurar largura das colunas
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
      { wch: 15 }   // Departamento
    ];
    
    cpuWorksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, cpuWorksheet, 'CPUs');

    // Criar planilha de instruções
    const instructions = [
      { 'Campo': 'Item', 'Descrição': 'Número sequencial do equipamento', 'Obrigatório': 'Sim', 'Exemplo': '1, 2, 3...' },
      { 'Campo': 'Nomenclatura', 'Descrição': 'Identificação única do equipamento', 'Obrigatório': 'Sim', 'Exemplo': 'DER-GTI001' },
      { 'Campo': 'Tombamento', 'Descrição': 'Número de tombamento patrimonial', 'Obrigatório': 'Não', 'Exemplo': '12345' },
      { 'Campo': 'E-estado', 'Descrição': 'Código numérico do estado do equipamento', 'Obrigatório': 'Sim', 'Exemplo': '210000509, 210000510' },
      { 'Campo': 'Marca/Modelo', 'Descrição': 'Marca e modelo do equipamento', 'Obrigatório': 'Sim', 'Exemplo': 'Dell OptiPlex 7090' },
      { 'Campo': 'Processador', 'Descrição': 'Modelo do processador', 'Obrigatório': 'Sim', 'Exemplo': 'Intel Core i5-11500' },
      { 'Campo': 'Memória RAM', 'Descrição': 'Quantidade de memória RAM', 'Obrigatório': 'Sim', 'Exemplo': '8GB DDR4' },
      { 'Campo': 'HD', 'Descrição': 'Disco rígido (se houver)', 'Obrigatório': 'Não', 'Exemplo': '1TB SATA' },
      { 'Campo': 'SSD', 'Descrição': 'SSD (se houver)', 'Obrigatório': 'Não', 'Exemplo': '512GB NVMe' },
      { 'Campo': 'Sistema Operacional', 'Descrição': 'Sistema operacional instalado', 'Obrigatório': 'Sim', 'Exemplo': 'Windows 11 Pro' },
      { 'Campo': 'No Domínio', 'Descrição': 'Se está no domínio', 'Obrigatório': 'Sim', 'Exemplo': 'SIM, NÃO' },
      { 'Campo': 'Data Formatação', 'Descrição': 'Data da última formatação', 'Obrigatório': 'Não', 'Exemplo': '2025-01-15' },
      { 'Campo': 'Responsável', 'Descrição': 'Responsável pelo equipamento', 'Obrigatório': 'Sim', 'Exemplo': 'João Silva' },
      { 'Campo': 'Desfazimento', 'Descrição': 'Informações de desfazimento', 'Obrigatório': 'Não', 'Exemplo': '' },
      { 'Campo': 'Departamento', 'Descrição': 'Departamento responsável', 'Obrigatório': 'Sim', 'Exemplo': 'TI, Administração' }
    ];

    const instructionsWorksheet = XLSX.utils.json_to_sheet(instructions);
    instructionsWorksheet['!cols'] = [
      { wch: 20 },  // Campo
      { wch: 40 },  // Descrição
      { wch: 12 },  // Obrigatório
      { wch: 25 }   // Exemplo
    ];
    
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instruções');

    // Gerar e baixar arquivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `template_importacao_equipamentos_${timestamp}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar template:', error);
    throw new Error('Erro ao gerar template Excel');
  }
}