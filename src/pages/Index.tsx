import { Navigate } from 'react-router-dom';
import { Dashboard } from '@/components/Dashboard';
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog';
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
  BarChart3,
  Table as TableIcon,
  LogOut,
  Download,
  FileText,
  RefreshCw,
  Trash2,
  Plus
} from 'lucide-react';

const Index = () => {
  console.log('Index renderizando...');
  
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { 
    equipmentData, 
    loading: equipmentLoading, 
    addCPU, 
    addMonitor, 
    removeCPU, 
    removeMonitor, 
    syncNow 
  } = useEquipment();
  const { toast } = useToast();
  console.log('Auth status:', { user, authLoading });
  console.log('Equipment data:', equipmentData);
  
  // Redirect to auth if not logged in
  if (authLoading) {
    console.log('Auth loading...');
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="animate-pulse text-center">
          <Monitor className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <p className="text-gray-300">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Nenhum usuário, redirecionando para auth...');
    return <Navigate to="/auth" replace />;
  }

  console.log('Usuário logado:', user);
  
  const handleDataImported = async (importedData: EquipmentData) => {
    console.log('Importando dados:', importedData);
    toast({
      title: "Dados importados!",
      description: "Os dados foram importados com sucesso.",
    });
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
      await exportToExcel(equipmentData, 'equipamentos_der_sesut');
      toast({
        title: "Exportação concluída",
        description: `${equipmentData.cpus.length} equipamentos exportados!`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadExcelTemplate();
      toast({
        title: "Template baixado!",
        description: "Template Excel baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar template",
        description: "Não foi possível baixar o template.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };
  
  console.log('Renderizando interface logada...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header com glassmorphism */}
      <header className="backdrop-blur-md bg-white/5 border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Monitor className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  DER-SESUT MONITORAMENTO
                </h1>
                <p className="text-sm text-gray-400">
                  {equipmentData.cpus.length} CPUs • {equipmentData.monitors?.length || 0} Monitores
                  {user && (
                    <span className="ml-2 text-blue-400">
                      • {user.username} {isAdmin() && '✨'}
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={syncNow} 
                variant="ghost" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              
              <Button 
                onClick={handleExportToExcel} 
                variant="ghost" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              {isAdmin() && (
                <>
                  <Button 
                    onClick={handleDownloadTemplate} 
                    variant="ghost" 
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                  
                  <FileImporter onDataImported={handleDataImported} />
                  <AddEquipmentDialog onAddCPU={addCPU} onAddMonitor={addMonitor} />
                </>
              )}
              
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                size="sm"
                className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-2xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="equipment" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <TableIcon className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-8">
            <Dashboard equipmentData={equipmentData} />
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-8">
            <div className="backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    Gerenciar Equipamentos
                  </h2>
                  <p className="text-gray-400">Adicione, edite ou remova equipamentos do sistema</p>
                </div>
                {isAdmin() && (
                  <div className="flex items-center space-x-3">
                    <FileImporter onDataImported={handleDataImported} />
                    <AddEquipmentDialog onAddCPU={addCPU} onAddMonitor={addMonitor} />
                  </div>
                )}
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-400" />
                    CPUs ({equipmentData.cpus.length})
                  </h3>
                  
                  {equipmentData.cpus.length === 0 ? (
                    <div className="text-center py-16">
                      <Monitor className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400 text-lg">Nenhuma CPU cadastrada</p>
                      <p className="text-gray-500 text-sm">Adicione CPUs usando o botão acima</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {equipmentData.cpus.map((cpu, index) => (
                        <div 
                          key={cpu.id} 
                          className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">
                              {cpu.nomenclatura}
                            </h4>
                            {isAdmin() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Tem certeza que deseja excluir este equipamento?')) {
                                    removeCPU(cpu.id);
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 hover:bg-red-500/40 text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-300">
                              <span className="text-gray-500">Modelo:</span> {cpu.marca_modelo}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-500">Depto:</span> {cpu.departamento}
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-500">Estado:</span> 
                              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                cpu.e_estado === 'Ativo' ? 'bg-green-500/20 text-green-300' :
                                cpu.e_estado === 'Inativo' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {cpu.e_estado}
                              </span>
                            </p>
                            <p className="text-gray-300">
                              <span className="text-gray-500">Responsável:</span> {cpu.responsavel}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
