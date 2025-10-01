import { Navigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog';
import { EditEquipmentDialog } from '@/components/EditEquipmentDialog';
import { FileImporter } from '@/components/FileImporter';
import { EquipmentTable } from '@/components/equipment/EquipmentTable';
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
    addMonitor,
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
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center items-center mb-8">
              <div className="relative">
                <div className="p-6 bg-gradient-primary rounded-3xl shadow-glow floating">
                  <Monitor className="h-16 w-16 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-2xl opacity-30 -z-10 scale-110"></div>
                <div className="absolute -inset-2 bg-gradient-accent rounded-3xl blur-3xl opacity-20 -z-20 scale-125 animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text tracking-tight">
              DER-SESUT
              <br />
              <span className="text-4xl md:text-5xl">MONITORAMENTO</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sistema moderno de gerenciamento de equipamentos de TI com
              <span className="text-primary font-semibold"> dashboards interativos</span>, 
              <span className="text-dashboard-success font-semibold"> importação inteligente</span> e 
              <span className="text-dashboard-info font-semibold"> análises em tempo real</span>.
            </p>
          </div>

          {/* Import Section - Only for admins */}
          {isAdmin() && (
            <div className="max-w-3xl mx-auto mb-12">
              <div className="glass-card p-8 rounded-3xl">
                <h2 className="text-2xl font-bold mb-6 text-center gradient-text">
                  Painel de Administração
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-button p-6 rounded-2xl hover:scale-105 transition-all duration-300">
                    <FileImporter onDataImported={handleDataImported} />
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Importe dados em lote via Excel
                    </p>
                  </div>
                  
                  <div className="glass-button p-6 rounded-2xl hover:scale-105 transition-all duration-300">
                    <AddEquipmentDialog 
                      onAddCPU={addCPU}
                      onAddMonitor={addMonitor}
                    />
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Adicione equipamentos manualmente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass-card glow-hover text-center p-8 rounded-2xl group">
              <div className="relative mb-6">
                <div className="p-4 bg-gradient-to-br from-dashboard-info/20 to-dashboard-info/10 rounded-2xl mx-auto w-fit">
                  <BarChart3 className="h-10 w-10 text-dashboard-info group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-dashboard-info/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-dashboard-info transition-colors duration-300">
                Dashboards Interativos
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize métricas e estatísticas em tempo real com gráficos modernos e interativos
              </p>
            </div>
            
            <div className="glass-card glow-hover text-center p-8 rounded-2xl group">
              <div className="relative mb-6">
                <div className="p-4 bg-gradient-to-br from-dashboard-success/20 to-dashboard-success/10 rounded-2xl mx-auto w-fit">
                  <Database className="h-10 w-10 text-dashboard-success group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-dashboard-success/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-dashboard-success transition-colors duration-300">
                Banco de Dados Seguro
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Dados armazenados com segurança no MySQL com backup automatizado e alta disponibilidade
              </p>
            </div>
            
            <div className="glass-card glow-hover text-center p-8 rounded-2xl group">
              <div className="relative mb-6">
                <div className="p-4 bg-gradient-to-br from-dashboard-warning/20 to-dashboard-warning/10 rounded-2xl mx-auto w-fit">
                  <Upload className="h-10 w-10 text-dashboard-warning group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-dashboard-warning/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <h3 className="font-bold text-lg mb-3 group-hover:text-dashboard-warning transition-colors duration-300">
                Importação Inteligente
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Suporte completo para planilhas Excel com validação automática e processamento em lote
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
      <header className="glass-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">DER-SESUT MONITORAMENTO</h1>
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
                className="glass-button"
                title="Sincronizar dados com servidor"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Button 
                onClick={handleExportToExcel}
                variant="outline" 
                size="sm"
                className="glass-button"
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
                    className="glass-button"
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
                    className="glass-button"
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
                className="glass-button"
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
          <TabsList className="glass-card grid w-full grid-cols-2 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <Dashboard equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-6">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Gerenciar Equipamentos</h2>
                {isAdmin() && (
                  <div className="flex items-center space-x-2">
                    <FileImporter onDataImported={handleDataImported} />
                    <AddEquipmentDialog onAddCPU={addCPU} onAddMonitor={addMonitor} />
                  </div>
                )}
              </div>
              
              <Tabs defaultValue="cpus" className="w-full">
                <TabsList className="glass-card mb-4">
                  <TabsTrigger value="cpus">CPUs ({equipmentData.cpus.length})</TabsTrigger>
                  <TabsTrigger value="monitors">Monitores ({equipmentData.monitors?.length || 0})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cpus">
                  <EquipmentTable 
                    equipmentData={{ cpus: equipmentData.cpus }}
                    onEditCPU={editCPU}
                    onDeleteCPU={removeCPU}
                  />
                </TabsContent>
                
                <TabsContent value="monitors">
                  <EquipmentTable 
                    equipmentData={{ monitors: equipmentData.monitors || [] }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
