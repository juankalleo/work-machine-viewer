import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useEquipment } from '@/hooks/useEquipment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EquipmentTable } from '@/components/equipment/EquipmentTable';
import { Dashboard } from '@/components/Dashboard';
import { AddEquipmentDialog } from '@/components/AddEquipmentDialog';
import { FileImporter } from '@/components/FileImporter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, BarChart3, Table as TableIcon, Search, LogOut, Download, FileText, RefreshCw } from 'lucide-react';
import { CPU, Monitor as MonitorType, EquipmentData } from '@/types/equipment';
import { exportToExcel } from '@/lib/excel-exporter';
import { downloadExcelTemplate } from '@/lib/excel-template';

const IndexSimple = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { equipmentData, isLoading: equipmentLoading, addCPU, addMonitor, editCPU, removeCPU, syncNow } = useEquipment();
  const { toast } = useToast();
  
  // Estado para busca simples
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCPUs, setFilteredCPUs] = useState<CPU[]>([]);
  const [filteredMonitors, setFilteredMonitors] = useState<MonitorType[]>([]);
  
  // Aplicar filtros simples
  useEffect(() => {
    if (!equipmentData) return;

    let cpus = equipmentData.cpus;
    let monitors = equipmentData.monitors;

    // Busca por texto geral
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      cpus = cpus.filter(cpu => 
        Object.values(cpu).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      );
      monitors = monitors.filter(monitor => 
        Object.values(monitor).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredCPUs(cpus);
    setFilteredMonitors(monitors);
  }, [equipmentData, searchTerm]);
  
  const handleDataImported = async (importedData: EquipmentData) => {
    let cpusAdded = 0;
    for (const cpu of importedData.cpus) {
      const success = await addCPU(cpu);
      if (success) cpusAdded++;
    }
    
    let monitorsAdded = 0;
    for (const monitor of importedData.monitors) {
      const success = await addMonitor(monitor);
      if (success) monitorsAdded++;
    }
    
    toast({
      title: "Dados importados!",
      description: `${cpusAdded} CPUs e ${monitorsAdded} monitores importados.`,
    });
  };
  
  const handleExportToExcel = async () => {
    if (!equipmentData || equipmentData?.cpus?.length === 0) {
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
  
  const handleEditCPU = async (id: string, cpuData: any): Promise<boolean> => {
    return await editCPU(id, cpuData);
  };
  
  const handleDeleteCPU = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta CPU?')) {
      await removeCPU(id);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  if (authLoading) {
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
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                  {equipmentData?.cpus?.length || 0} CPUs • {equipmentData?.monitors?.length || 0} Monitores
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

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-2xl">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-xl transition-all duration-300"
            >
              <Search className="h-4 w-4" />
              Buscar
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
            <Dashboard equipmentData={equipmentData || { cpus: [], monitors: [] }} />
          </TabsContent>
          
          <TabsContent value="search" className="mt-8">
            <div className="space-y-6">
              <div className="backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">Busca de Equipamentos</h2>
                
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por qualquer campo (nome, modelo, responsável, etc.)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4"
                  />
                </div>
                
                <div className="text-sm text-gray-400 mb-4">
                  CPUs encontradas: {filteredCPUs.length} • Monitores encontrados: {filteredMonitors.length}
                </div>
              </div>
              
              <EquipmentTable 
                cpus={filteredCPUs}
                monitors={filteredMonitors}
                onEditCPU={handleEditCPU}
                onEditMonitor={() => {}}
                onDeleteCPU={handleDeleteCPU}
                onDeleteMonitor={() => {}}
                isAdmin={isAdmin()}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-8">
            <EquipmentTable 
              cpus={equipmentData?.cpus || []}
              monitors={equipmentData?.monitors || []}
              onEditCPU={handleEditCPU}
              onEditMonitor={() => {}}
              onDeleteCPU={handleDeleteCPU}
              onDeleteMonitor={() => {}}
              isAdmin={isAdmin()}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default IndexSimple;