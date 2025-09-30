import { Navigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog';
import { EditEquipmentDialog } from '@/components/EditEquipmentDialog';
import { FileImporter } from '@/components/FileImporter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEquipment } from '@/hooks/useEquipment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/excel-exporter';
import { downloadExcelTemplate } from '@/lib/excel-template';
import { EquipmentData } from '@/types/equipment';
import { 
  Monitor, 
  Upload, 
  Database, 
  Trash2,
  BarChart3,
  FileSpreadsheet,
  Table as TableIcon,
  Plus,
  LogOut,
  User,
  Shield,
  Download,
  FileText,
  RefreshCw
} from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { 
    equipmentData, 
    isLoading, 
    error,
    addCPU,
    editCPU,
    removeCPU,
    fetchAllEquipment,
    syncNow
  } = useEquipment();
  const { toast } = useToast();

  // Redirect to auth if not logged in
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard-bg">
        <div className="animate-pulse text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleClearData = async () => {
    if (!isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem limpar dados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { clearSampleData } = await import('@/lib/storage');
      clearSampleData();
      
      // Recarregar dados
      await fetchAllEquipment();
      
      toast({
        title: "Dados de exemplo removidos",
        description: "Máquinas de exemplo foram removidas do sistema.",
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar os dados de exemplo.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDataImported = async (importedData: EquipmentData) => {
    try {
      let successCount = 0;
      let errorCount = 0;
      
      console.log('\n🚀 Iniciando processo de importação:');
      console.log(`  📊 CPUs para processar: ${importedData.cpus.length}`);
      console.log(`  📺 Monitores para processar: ${importedData.monitors?.length || 0}`);
      
      if (importedData.cpus.length === 0) {
        toast({
          title: "Nenhum equipamento encontrado",
          description: "O arquivo Excel não contém dados válidos de equipamentos. Verifique o formato do arquivo.",
          variant: "destructive",
        });
        return;
      }
      
      // Adicionar todas as CPUs importadas
      for (const [index, cpu] of importedData.cpus.entries()) {
        try {
          console.log(`\n🔄 Processando CPU ${index + 1}/${importedData.cpus.length}:`);
          console.log('  📋 Dados originais:', {
            nomenclatura: cpu.nomenclatura,
            marca_modelo: cpu.marca_modelo,
            tombamento: cpu.tombamento,
            responsavel: cpu.responsavel,
            departamento: cpu.departamento
          });
          
          // Validação prévia dos dados
          const hasRequiredData = (
            (cpu.nomenclatura && cpu.nomenclatura.trim()) ||
            (cpu.marca_modelo && cpu.marca_modelo.trim()) ||
            (cpu.processador && cpu.processador.trim()) ||
            (cpu.tombamento && cpu.tombamento.trim())
          );
          
          if (!hasRequiredData) {
            console.log('  ⚠️ CPU ignorada - nenhum campo principal preenchido');
            errorCount++;
            continue;
          }
          
          // Garantir que campos obrigatórios tenham valores válidos
          const cpuData = {
            item: cpu.item || (index + 1),
            nomenclatura: (cpu.nomenclatura || '').trim(),
            tombamento: (cpu.tombamento || '').trim(),
            e_estado: (cpu.e_estado || 'Ativo').trim(),
            marca_modelo: (cpu.marca_modelo || '').trim(),
            processador: (cpu.processador || '').trim(),
            memoria_ram: (cpu.memoria_ram || '').trim(),
            hd: cpu.hd && cpu.hd.trim() ? cpu.hd.trim() : null,
            ssd: cpu.ssd && cpu.ssd.trim() ? cpu.ssd.trim() : null,
            sistema_operacional: (cpu.sistema_operacional || '').trim(),
            no_dominio: (cpu.no_dominio || 'NÃO').trim(),
            data_formatacao: cpu.data_formatacao && cpu.data_formatacao.trim() ? cpu.data_formatacao.trim() : null,
            responsavel: (cpu.responsavel || '').trim(),
            desfazimento: cpu.desfazimento && cpu.desfazimento.trim() ? cpu.desfazimento.trim() : null,
            departamento: (cpu.departamento || 'TI').trim()
          };
          
          console.log('  🔧 Dados processados:', cpuData);
          
          // Usar addCPU do hook que já faz a validação e atualização do estado
          const success = await addCPU(cpuData);
          
          if (success) {
            successCount++;
            const displayName = cpuData.nomenclatura || cpuData.marca_modelo || cpuData.processador || `CPU-${index + 1}`;
            console.log('  ✅ CPU importada:', displayName);
          } else {
            errorCount++;
            console.error('  ❌ Falha ao salvar CPU no sistema');
          }
        } catch (cpuError) {
          console.error('  💥 Erro ao processar CPU:', cpuError);
          errorCount++;
        }
      }
      
      // TODO: Adicionar suporte para monitores quando necessário
      // if (importedData.monitors && importedData.monitors.length > 0) {
      //   // Processar monitores
      // }
      
      // Recarregar dados após importação
      console.log('\n🔄 Recarregando dados do sistema...');
      await fetchAllEquipment();
      
      // Exibir resultado final
      console.log('\n📈 Resultado da importação:');
      console.log(`  ✅ Sucessos: ${successCount}`);
      console.log(`  ❌ Erros: ${errorCount}`);
      console.log(`  📊 Total processado: ${successCount + errorCount}`);
      
      if (errorCount === 0 && successCount > 0) {
        toast({
          title: "Importação concluída! ✅",
          description: `${successCount} equipamentos importados com sucesso.`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: `Importação parcial ⚠️`,
          description: `${successCount} equipamentos importados, ${errorCount} falharam.`,
          variant: errorCount > successCount ? "destructive" : "default",
        });
      } else if (successCount === 0) {
        toast({
          title: "Falha na importação ❌",
          description: "Nenhum equipamento pôde ser importado. Verifique o formato dos dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Erro crítico na importação:', error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro inesperado durante a importação.",
        variant: "destructive",
      });
    }
  };

  const addMonitor = async (monitorData: any): Promise<boolean> => {
    try {
      const { createMonitor } = await import('@/lib/storage');
      const newMonitor = createMonitor(monitorData);
      
      // Recarregar dados após adição
      await fetchAllEquipment();
      
      toast({
        title: "Monitor adicionado",
        description: "Monitor adicionado com sucesso!",
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao adicionar monitor",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadExcelTemplate();
      toast({
        title: "Template baixado!",
        description: "Template Excel para importação foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      toast({
        title: "Erro ao baixar template",
        description: "Não foi possível gerar o template Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = async () => {
    if (!equipmentData || equipmentData.cpus.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há equipamentos para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Preparar dados para exportação
      const dataToExport = {
        cpus: equipmentData.cpus,
        monitors: equipmentData.monitors || []
      };
      
      await exportToExcel(dataToExport, 'equipamentos_der_sesut');
      
      toast({
        title: "Exportação concluída",
        description: `${equipmentData.cpus.length} equipamentos exportados com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados para Excel.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard-bg">
        <div className="animate-pulse text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!equipmentData) {
    return (
      <div className="min-h-screen bg-dashboard-bg py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center mb-6">
              <div className="p-4 bg-gradient-primary rounded-full shadow-glow">
                <Monitor className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              DER-SESUT MONITORAMENTO
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sistema de Gerenciamento de Equipamentos de TI. 
              Importe planilhas e visualize estatísticas detalhadas sobre CPUs e monitores.
            </p>
          </div>

          {/* Import Section - Only for admins */}
          {isAdmin() && (
            <div className="max-w-2xl mx-auto space-y-6">
              <FileImporter onDataImported={handleDataImported} />
              
              {/* Add Equipment Button - Only for admins */}
              <div className="text-center">
                <AddEquipmentDialog 
                  onAddCPU={addCPU}
                  onAddMonitor={addMonitor}
                />
              </div>
            </div>
          )}

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-card">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-dashboard-info" />
              <h3 className="font-semibold mb-2">Dashboards Interativos</h3>
              <p className="text-sm text-muted-foreground">
                Visualize métricas e estatísticas em tempo real
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-card">
              <Database className="h-8 w-8 mx-auto mb-3 text-dashboard-success" />
              <h3 className="font-semibold mb-2">Banco de Dados</h3>
              <p className="text-sm text-muted-foreground">
                Dados armazenados com segurança no Supabase
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-gradient-card shadow-card">
              <Upload className="h-8 w-8 mx-auto mb-3 text-dashboard-warning" />
              <h3 className="font-semibold mb-2">Importação Excel</h3>
              <p className="text-sm text-muted-foreground">
                Suporte completo para planilhas .xlsx e .xls
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-dashboard-card shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">DER-SESUT MONITORAMENTO</h1>
                <p className="text-sm text-muted-foreground">
                  {equipmentData.cpus.length} CPUs • {equipmentData.monitors?.length || 0} Monitores
                  {user && (
                    <span className="ml-2">
                      • {user.username} {isAdmin() && '(Admin)'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={syncNow}
                variant="outline" 
                size="sm"
                title="Sincronizar dados com servidor"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Button 
                onClick={handleExportToExcel}
                variant="outline" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              {isAdmin() && (
                <>
                  <Button 
                    onClick={handleDownloadTemplate}
                    variant="outline" 
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Template Excel
                  </Button>
                  <FileImporter onDataImported={handleDataImported} />
                  <AddEquipmentDialog onAddCPU={addCPU} onAddMonitor={addMonitor} />
                  <Button 
                    onClick={handleClearData}
                    variant="outline" 
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover Exemplos
                  </Button>
                </>
              )}
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard data={equipmentData} />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <div className="bg-dashboard-card rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Equipamentos</h2>
                {isAdmin() && (
                  <AddEquipmentDialog onAddCPU={addCPU} onAddMonitor={addMonitor} />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipmentData.cpus.map((cpu) => (
                  <div key={cpu.id} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{cpu.nomenclatura}</h3>
                      {isAdmin() && (
                        <div className="flex space-x-1">
                          <EditEquipmentDialog 
                            cpu={cpu} 
                            onUpdateCPU={editCPU}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir este equipamento?')) {
                                removeCPU(cpu.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{cpu.marca_modelo}</p>
                    <p className="text-sm text-gray-600">Departamento: {cpu.departamento}</p>
                    <p className="text-sm text-gray-600">E-estado: {cpu.e_estado}</p>
                    <p className="text-sm text-gray-600">Responsável: {cpu.responsavel}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;